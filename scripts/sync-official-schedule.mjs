#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";

const LEADS = ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"];
const TYPE_RULES = [
  ["birthday", /生日/],
  ["pass", /密約|密约|Promise/i],
  ["rerun", /復刻|复刻|返場|返场|rerun/i],
  ["story", /主線|主线/],
  ["monthly", /月卡/],
  ["daily", /日卡/],
  ["mixed", /混池|多人池|全員池|全员池/],
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function taipeiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isoDate(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function inferYear(month, referenceDate, previousMonth = null) {
  const reference = new Date(referenceDate);
  let year = reference.getUTCFullYear();
  const referenceMonth = reference.getUTCMonth() + 1;
  if (previousMonth !== null && month < previousMonth) year += 1;
  else if (month + 6 < referenceMonth) year += 1;
  else if (month > referenceMonth + 6) year -= 1;
  return year;
}

function validDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function extractDateRanges(message, referenceDate = new Date()) {
  const normalized = String(message || "")
    .replace(/\r/g, "")
    .replace(/[－—–]/g, "-")
    .replace(/～/g, "~");
  const patterns = [
    /(?:(\d{4})\s*年\s*)?(\d{1,2})\s*月\s*(\d{1,2})\s*日[\s\S]{0,24}?(?:~|-|至|到)[^\d\n]{0,18}(?:(\d{4})\s*年\s*)?(\d{1,2})\s*月\s*(\d{1,2})\s*日/g,
    /(?:(\d{4})[/.\-])?(\d{1,2})[/.\-](\d{1,2})[\s\S]{0,20}?(?:~|至|到)[^\d\n]{0,12}(?:(\d{4})[/.\-])?(\d{1,2})[/.\-](\d{1,2})/g,
  ];
  const ranges = [];
  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const startMonth = Number(match[2]);
      const startDay = Number(match[3]);
      const endMonth = Number(match[5]);
      const endDay = Number(match[6]);
      const startYear = match[1] ? Number(match[1]) : inferYear(startMonth, referenceDate);
      const endYear = match[4] ? Number(match[4]) : inferYear(endMonth, referenceDate, startMonth);
      if (!validDate(startYear, startMonth, startDay) || !validDate(endYear, endMonth, endDay)) continue;
      const contextStart = Math.max(0, match.index - 50);
      const contextEnd = Math.min(normalized.length, match.index + match[0].length + 40);
      const context = normalized.slice(contextStart, contextEnd);
      let score = 0;
      if (/活動時間|活动时间|許願時間|许愿时间|密約時間|密约时间|Event Duration/i.test(context)) score += 8;
      if (/兌換商店|兑换商店|商店截止|領取時間|领取时间|登入|登录|預下載|预下载|維護|维护/.test(context)) score -= 7;
      if (/許願|许愿|密約|密约|復刻|复刻|生日|卡池|思念|活動|活动/.test(context)) score += 3;
      const item = {
        start: isoDate(startYear, startMonth, startDay),
        end: isoDate(endYear, endMonth, endDay),
        context,
        score,
      };
      const key = `${item.start}:${item.end}`;
      const existing = ranges.find((range) => `${range.start}:${range.end}` === key);
      if (!existing || item.score > existing.score) {
        if (existing) ranges.splice(ranges.indexOf(existing), 1);
        ranges.push(item);
      }
    }
  }
  return ranges.sort((a, b) => b.score - a.score);
}

export function classifyPost(message) {
  const text = String(message || "");
  const type = TYPE_RULES.find(([, pattern]) => pattern.test(text))?.[0] || null;
  const leads = LEADS.filter((lead) => text.includes(lead));
  return { type, leads };
}

function dayDistance(left, right) {
  return Math.abs((new Date(`${left}T00:00:00Z`) - new Date(`${right}T00:00:00Z`)) / 86400000);
}

function normalizedSet(values = []) {
  return [...new Set(values)].sort();
}

function sameSet(left, right) {
  return JSON.stringify(normalizedSet(left)) === JSON.stringify(normalizedSet(right));
}

function eventKeywords(name) {
  let value = String(name || "");
  for (const lead of LEADS) value = value.replaceAll(lead, "");
  value = value.replace(/生日|復刻|复刻|密約|密约|日卡|月卡|主線|主线|分線|分线|卡池|混池|新一輪|新一轮|新|＋|\+|・|／|\/|[\s、，,。]/g, " ");
  return value.split(/\s+/).filter((token) => token.length >= 2);
}

export function matchScheduleEvent(events, signal) {
  const ranked = events.map((event) => {
    let score = 0;
    const reasons = [];
    if (signal.type) {
      if (event.type === signal.type) {
        score += 9;
        reasons.push("類型相同");
      } else {
        score -= 12;
      }
    }
    const eventLeads = Array.isArray(event.leads) ? event.leads : [];
    if (signal.leads.length) {
      if (sameSet(eventLeads, signal.leads)) {
        score += 7;
        reasons.push("角色相同");
      } else if (eventLeads.some((lead) => signal.leads.includes(lead))) {
        score += 3;
        reasons.push("角色重疊");
      } else {
        score -= 10;
      }
    }
    const keywords = eventKeywords(event.name);
    if (keywords.some((keyword) => signal.message.includes(keyword))) {
      score += 13;
      reasons.push("活動名稱相符");
    }
    if (event.start) {
      const distance = dayDistance(event.start, signal.range.start);
      if (distance <= 7) score += 7;
      else if (distance <= 30) score += 4;
      else if (distance <= 60) score += 1;
      else score -= 5;
      reasons.push(`日期差 ${Math.round(distance)} 天`);
    }
    if (event.tentative) score += 1;
    return { event, score, reasons };
  }).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const runnerUp = ranked[1];
  if (!best || best.score < 10) return { match: null, ranked };
  if (runnerUp && best.score - runnerUp.score < 4) return { match: null, ranked };
  return { match: best, ranked };
}

function loadSchedule(file) {
  const source = fs.readFileSync(file, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: file });
  if (!Array.isArray(context.window.SCHEDULE)) throw new Error("schedule.js 沒有有效的 window.SCHEDULE 陣列");
  return { source, events: context.window.SCHEDULE };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateEventLine(source, name, patch) {
  const pattern = new RegExp(`^.*name:\\s*${escapeRegExp(JSON.stringify(name))}.*$`, "m");
  const line = source.match(pattern)?.[0];
  if (!line) throw new Error(`找不到排程項目：${name}`);
  let next = line
    .replace(/start:\s*"[^"]*"/, `start: ${JSON.stringify(patch.start)}`)
    .replace(/end:\s*"[^"]*"/, `end: ${JSON.stringify(patch.end)}`)
    .replace(/tentative:\s*(?:true|false)/, "tentative: false");
  if (/source:\s*"[^"]*"/.test(next)) {
    next = next.replace(/source:\s*"[^"]*"/, `source: ${JSON.stringify(patch.source)}`);
  } else {
    next = next.replace(/tentative:\s*false,\s*/, `tentative: false, source: ${JSON.stringify(patch.source)}, `);
  }
  return source.replace(line, next);
}

function updateMetaDate(source, value) {
  return source.replace(/(window\.SCHEDULE_META\s*=\s*\{[\s\S]*?updated:\s*)"[^"]*"/, `$1${JSON.stringify(value)}`);
}

async function fetchJson(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20_000) });
      const body = await response.json();
      if (!response.ok || body.error) {
        const message = body.error?.message || `${response.status} ${response.statusText}`;
        throw new Error(message);
      }
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

async function fetchFacebookPosts(now) {
  if (process.env.META_POSTS_FILE) {
    const fixture = JSON.parse(fs.readFileSync(process.env.META_POSTS_FILE, "utf8"));
    return Array.isArray(fixture) ? fixture : fixture.data;
  }
  const token = process.env.META_APP_ACCESS_TOKEN;
  if (!token) throw new Error("缺少 META_APP_ACCESS_TOKEN GitHub Secret");
  const version = process.env.META_GRAPH_VERSION || "v26.0";
  const pageId = process.env.META_PAGE_ID || "102920706051241";
  const lookbackHours = Number(process.env.SYNC_LOOKBACK_HOURS || 48);
  const since = Math.floor((now.getTime() - lookbackHours * 3600000) / 1000);
  const url = new URL(`https://graph.facebook.com/${version}/${pageId}/posts`);
  url.searchParams.set("fields", "id,message,created_time,permalink_url");
  url.searchParams.set("limit", "25");
  url.searchParams.set("since", String(since));
  const body = await fetchJson(url, { headers: { Authorization: `Bearer ${token}` } });
  return body.data || [];
}

async function createReviewIssues(items) {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository || !items.length) return;
  const api = `https://api.github.com/repos/${repository}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const existing = await fetchJson(`${api}/issues?state=all&per_page=100`, { headers });
  for (const item of items) {
    const marker = `<!-- official-post:${item.post.id} -->`;
    if (existing.some((issue) => issue.body?.includes(marker))) continue;
    const top = item.ranked.slice(0, 3).map(({ event, score }) => `- ${event.name}（分數 ${score}）`).join("\n");
    const body = [
      marker,
      "自動排程找到官方貼文，但無法安全判定要更新哪一筆，因此沒有修改網站。",
      "",
      `官方貼文：${item.post.permalink_url || "未提供連結"}`,
      `辨識日期：${item.range.start} ～ ${item.range.end}`,
      "",
      "可能的排程項目：",
      top || "- 無",
      "",
      "貼文摘要：",
      `> ${String(item.post.message || "").slice(0, 1200).replace(/\n/g, "\n> ")}`,
    ].join("\n");
    await fetchJson(`${api}/issues`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ title: `[排程待確認] 官方貼文 ${item.post.id}`, body }),
    });
  }
}

function appendSummary(changes, reviews, postCount) {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (!summary) return;
  const lines = [
    "## 戀與深空官方排程同步",
    "",
    `- 檢查貼文：${postCount} 篇`,
    `- 自動更新：${changes.length} 筆`,
    `- 需要人工確認：${reviews.length} 筆`,
  ];
  if (changes.length) {
    lines.push("", "| 排程 | 日期 | 官方貼文 |", "|---|---|---|");
    for (const change of changes) lines.push(`| ${change.name} | ${change.start} ～ ${change.end} | [來源](${change.source}) |`);
  }
  fs.appendFileSync(summary, `${lines.join("\n")}\n`);
}

export async function runSync({ scheduleFile, now = new Date(), dryRun = false } = {}) {
  const file = scheduleFile || path.resolve("schedule.js");
  const loaded = loadSchedule(file);
  const posts = (await fetchFacebookPosts(now))
    .filter((post) => post?.message && post?.created_time)
    .sort((left, right) => new Date(left.created_time) - new Date(right.created_time));
  let source = loaded.source;
  const changes = [];
  const reviews = [];

  for (const post of posts) {
    const ranges = extractDateRanges(post.message, new Date(post.created_time));
    if (!ranges.length) continue;
    const classification = classifyPost(post.message);
    if (!classification.type && !classification.leads.length) continue;
    const range = ranges[0];
    const signal = { ...classification, message: post.message, range };
    const result = matchScheduleEvent(loaded.events, signal);
    if (!result.match) {
      reviews.push({ post, range, ranked: result.ranked });
      continue;
    }
    const event = result.match.event;
    const sourceUrl = post.permalink_url || `https://www.facebook.com/${post.id}`;
    const unchanged = event.start === range.start && event.end === range.end && event.tentative === false && event.source === sourceUrl;
    if (unchanged) continue;
    source = updateEventLine(source, event.name, { start: range.start, end: range.end, source: sourceUrl });
    event.start = range.start;
    event.end = range.end;
    event.tentative = false;
    event.source = sourceUrl;
    changes.push({ name: event.name, start: range.start, end: range.end, source: sourceUrl });
  }

  if (changes.length) source = updateMetaDate(source, taipeiDate(now));
  if (changes.length && !dryRun) fs.writeFileSync(file, source);
  await createReviewIssues(reviews);
  appendSummary(changes, reviews, posts.length);
  return { posts: posts.length, changes, reviews };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  runSync({
    scheduleFile: process.env.SCHEDULE_FILE || path.resolve("schedule.js"),
    now: process.env.SYNC_NOW ? new Date(process.env.SYNC_NOW) : new Date(),
    dryRun: process.argv.includes("--dry-run"),
  }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  }).catch((error) => {
    console.error(`同步失敗：${error.message}`);
    process.exitCode = 1;
  });
}
