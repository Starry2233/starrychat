// ─── Tool Definitions (OpenAI function-calling format) ──────

export const toolDefinitions = [
  {
    type: 'function' as const,
    function: {
      name: 'bing_search',
      description: '通过必应搜索引擎搜索互联网上的最新信息。当用户询问实时新闻、最新事件、你不知道的信息时使用。',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词，建议使用中文关键词以获得更好的中文搜索结果',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'stock_query',
      description: '查询A股股票的各种数据，包括日线行情、技术指标（KDJ/MACD/MA/BOLL/RSI等）、龙虎榜等。注意：除日线行情和龙虎榜外，其他数据类型需要提供 date 参数（格式 YYYY-MM-DD）。',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: [
              '日线行情', 'KDJ', '均线MA', '布林带BOLL',
              'RSI', 'WR', 'CCI', 'BIAS', '龙虎榜', '分时KDJ', '神奇九转',
            ],
            description: '要查询的数据类型',
          },
          code: {
            type: 'string',
            description: '股票代码，如 600004（上海）、000001（深圳）、300750（创业板）',
          },
          date: {
            type: 'string',
            description: '查询日期，格式 YYYY-MM-DD。除"日线行情"和"龙虎榜"外，其他类型必填',
          },
          startDate: {
            type: 'string',
            description: '开始日期（日线行情用），格式 YYYY-MM-DD',
          },
          endDate: {
            type: 'string',
            description: '结束日期（日线行情用），格式 YYYY-MM-DD',
          },
        },
        required: ['type', 'code'],
      },
    },
  },
];

// ─── Tool Executors ───────────────────────────────────────────

// ─── CORS-safe fetch wrapper ──────────────────────────────────

// In dev mode (Vite proxy), use relative paths to avoid CORS issues.
// In production (Capacitor native), use direct URLs (WKWebView CORS is handled).
function proxyBase(): string | null {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
      return '';
    }
  } catch {}
  return null;
}

async function corsFetch(url: string, init?: RequestInit): Promise<Response> {
  // In Capacitor native, use native HTTP to bypass CORS
  const capacitor = (typeof window !== 'undefined') ? (window as any).Capacitor : null;
  if (capacitor?.isNative) {
    try {
      const { CapacitorHttp } = await import(/* @vite-ignore */ '@capacitor/core');
      const opts: any = { url, method: init?.method || 'GET' };
      if (init?.headers) opts.headers = init.headers as Record<string, string>;
      const resp = await CapacitorHttp.request(opts);
      return new Response(JSON.stringify(resp.data), {
        status: resp.status,
        statusText: resp.status === 200 ? 'OK' : 'Error',
      });
    } catch {}
  }
  // Fallback: regular fetch (browser dev or web)
  return fetch(url, init);
}

// ─── Stock API ────────────────────────────────────────────────

function stockBase(): string {
  const proxy = proxyBase();
  if (proxy !== null) return '/stock-api';        // dev proxy
  return 'https://www.stockapi.com.cn/v1';         // direct
}

// All working endpoints (verified 2026-04)
// Quota endpoints require `date` param. 资金流向/量比/SAR return 500 — removed.
const stockEndpoints: Record<string, (args: any, base: string) => string> = {
  '日线行情': (a, b) =>
    `${b}/base/day?code=${a.code}&startDate=${a.startDate ?? ''}&endDate=${a.endDate ?? ''}`,
  'KDJ': (a, b) =>
    `${b}/quota/kdj?code=${a.code}&cycle=9&cycle1=3&cycle2=3&date=${a.date}`,
  '均线MA': (a, b) =>
    `${b}/quota/ma?code=${a.code}&ma=5,10,20&date=${a.date}&rehabilitation=100&calculationCycle=100`,
  '布林带BOLL': (a, b) =>
    `${b}/quota/boll?code=${a.code}&cycle=26&date=${a.date}&rehabilitation=100&calculationCycle=100`,
  'RSI': (a, b) =>
    `${b}/quota/rsi?code=${a.code}&cycle1=6&cycle2=12&cycle3=24&date=${a.date}`,
  'WR': (a, b) =>
    `${b}/quota/wr?code=${a.code}&cycle1=10&cycle2=6&date=${a.date}&rehabilitation=100&calculationCycle=100`,
  'CCI': (a, b) =>
    `${b}/quota/cci?code=${a.code}&cycle=14&date=${a.date}`,
  'BIAS': (a, b) =>
    `${b}/quota/bias?code=${a.code}&cycle1=6&cycle2=12&cycle3=24&date=${a.date}`,
  '龙虎榜': (a, b) => `${b}/base/dragonTiger${a.date ? `?date=${a.date}` : ''}`,
  '分时KDJ': (a, b) => `${b}/base/minKdj?code=${a.code}&cycle=9&cycle1=3&cycle2=3`,
  '神奇九转': (a, b) =>
    `${b}/quota/nineTurn?code=${a.code}&date=${a.date}`,
};

async function stockQuery(args: {
  type: string;
  code: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<string> {
  const builder = stockEndpoints[args.type];
  if (!builder) {
    return `不支持的数据类型: ${args.type}。支持的类型: ${Object.keys(stockEndpoints).join(', ')}`;
  }

  const url = builder(args, stockBase());

  try {
    const res = await corsFetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return `股票API请求失败 (${res.status}): ${text.slice(0, 500)}`;
    }

    const data = await res.json();
    if (data.code !== 20000) {
      return `股票API返回异常: ${JSON.stringify(data)}`;
    }
    return JSON.stringify(data.data, null, 2);
  } catch (err: any) {
    return `股票API请求异常: ${err?.message || '未知错误'}`;
  }
}

function bingBase(): string {
  const proxy = proxyBase();
  if (proxy !== null) return '/bing-proxy';
  return 'https://cn.bing.com';
}

async function bingSearch(query: string): Promise<string> {
  const url = `${bingBase()}/search?q=${encodeURIComponent(query)}`;

  const res = await corsFetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`Bing search 请求失败 (${res.status})`);
  }

  const html = await res.text();

  // Extract search result snippets from the HTML
  const snippets: string[] = [];
  const liRegex = /<li class="b_algo">(.*?)<\/li>/gs;
  let match: RegExpExecArray | null;

  while ((match = liRegex.exec(html)) !== null) {
    const item = match[1];

    // Extract title
    const titleMatch = item.match(/<h2><a[^>]*>(.*?)<\/a><\/h2>/s);
    const title = titleMatch ? stripTags(titleMatch[1]) : '';

    // Extract URL
    const urlMatch = item.match(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/);
    const link = urlMatch ? urlMatch[1] : '';

    // Extract snippet
    const snippetMatch = item.match(/<p[^>]*>(.*?)<\/p>/s);
    const snippet = snippetMatch ? stripTags(snippetMatch[1]) : '';

    if (title || snippet) {
      snippets.push(`- [${title}](${link})\n  ${snippet}`);
    }
  }

  if (snippets.length === 0) {
    return `搜索"${query}"未找到结构化结果。\n\n原始页面片段：\n${html.slice(0, 3000)}`;
  }

  return `## 搜索"${query}"的结果\n\n${snippets.slice(0, 10).join('\n\n')}`;
}

function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Execute a tool call ─────────────────────────────────────

export async function executeToolCall(toolCall: {
  id: string;
  function: { name: string; arguments: string };
}): Promise<{ role: 'tool'; tool_call_id: string; content: string }> {
  const args = JSON.parse(toolCall.function.arguments);

  let content: string;
  try {
    switch (toolCall.function.name) {
      case 'bing_search':
        content = await bingSearch(args.query);
        break;
      case 'stock_query':
        content = await stockQuery(args);
        break;
      default:
        content = `未知工具: ${toolCall.function.name}`;
    }
  } catch (err: any) {
    content = `工具执行错误: ${err?.message || '未知错误'}`;
  }

  return {
    role: 'tool',
    tool_call_id: toolCall.id,
    content,
  };
}
