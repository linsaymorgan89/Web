var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// ../src/data/site.json
var site_default = {
  phone: "945-397-2900",
  email: "morgan@theeroticmorgan.com",
  onlyfans: "onlyfans.com/theeroticmorgan",
  goodwill: {
    price: "50",
    tagline: "one time, forever"
  },
  home: {
    eyebrow: "Dallas, Texas \xB7 Independent",
    lede: "Class, style, laughter, and a night you will not forget. Dinner dates, nights on the town, and our most memorable time together, in private."
  },
  contactFaq: [
    [
      "How do I contact Morgan?",
      "Text or call 945-397-2900 for the fastest response. For longer appointments, use the appointment request form 2-3 days in advance. Email morgan@theeroticmorgan.com works too."
    ],
    [
      "What should my first text say?",
      "Include your name, where you saw my ad, whether you want incall or outcall, and the date and time you have in mind. That single message gets the fastest yes."
    ],
    [
      "Do you require screening or deposits?",
      "No references or deposits required for standard appointments (over nights and weekend trips excepted). P411 or OH2 membership helps but is not necessary."
    ]
  ],
  goodwillFaq: [
    [
      "How much is access to The Good Stuff?",
      "One single payment of $50 for lifetime access. No recurring charges, ever."
    ],
    [
      "Why can\u2019t I pay with a card?",
      "Because of the adult nature of the content, Stripe doesn\u2019t allow credit card payments, so payments are made directly via Zelle, Venmo, CashApp, PayPal, or Apple Pay."
    ],
    [
      "What do I get with my membership?",
      "Unlimited lifetime access to my sexiest nude photos (updated at least monthly), solo videos, BG videos taken with consenting clients, and one free custom video."
    ]
  ],
  goodwillPerks: [
    "My sexiest nude photos (updated monthly)",
    "Solo videos",
    "BG videos",
    "Custom videos and pics (one free 1-minute custom video, all after $25)"
  ]
};

// ../src/data/rates.json
var rates_default = {
  wishlistUrl: "https://mywishlist.online/w/rsv35c/morgs-wishlist",
  wishlistLabel: "Morg\u2019s Wishlist",
  local: [
    [
      "One Hour",
      "400"
    ],
    [
      "Two Hours (Recommended)",
      "700"
    ],
    [
      "Three Hours (Dinner Date)",
      "1000"
    ],
    [
      "Overnight (10-12 hours)",
      "1500"
    ],
    [
      "Weekend Trip",
      "2500"
    ]
  ],
  touring: [
    [
      "One Hour",
      "500"
    ],
    [
      "Two Hours (Recommended)",
      "900"
    ],
    [
      "Three Hours (Dinner Date)",
      "1200"
    ],
    [
      "Overnight (10-12 hours)",
      "2000"
    ],
    [
      "Weekend Trip",
      "4000"
    ]
  ],
  addons: [
    [
      "Role Play",
      "150"
    ],
    [
      "PSE (call for details)",
      "200/hr"
    ],
    [
      "Massage (can be booked alone)",
      "250/hr"
    ],
    [
      "BDSM",
      "150"
    ],
    [
      "Dancing (Parties or Private)",
      "150"
    ]
  ]
};

// ../src/data/tours.json
var tours_default = [
  {
    city: "Colorado",
    dates: "September 7-12, 2026",
    blurb: "Denver first, then wherever the adventure takes me. Outcall anywhere in the state; 2-hour minimum beyond 40 miles. $40 pre-book discount.",
    status: "upcoming"
  }
];

// ../src/data/posts.json
var posts_default = {
  categories: {
    "client-guides": "Client Guides",
    touring: "Touring",
    "morgans-voice": "Morgan\u2019s Voice"
  },
  posts: [
    {
      slug: "get-the-goods",
      title: 'What is "The good stuff"?',
      date: "2026-08-01",
      category: "client-guides",
      answer: "The Good Stuff is my members-only vault: a one-time $50 payment for lifetime access to my sexiest photos and videos, paid by Zelle, CashApp, Venmo, PayPal, or Apple Pay.",
      body: [
        "For whatever reason, whether it be location or finances or just nerves keeping you from picking up the phone, we will not be meeting in the immediate future. That\u2019s ok. I have something special just for you. On my photo gallery page, there is a portal to register and pay once for lifetime access to my absolute hottest nudes. Pics so hot, I did not post them on my onlyfans. Some I sent as private messages to my fans, but most have been trapped in my phone, just begging to be seen.",
        "I will be adding more sexy pics at least once a month. If you see new photos in my photo gallery, odds are, there are much naughtier versions posted in THE GOOD STUFF.",
        "I will also be adding solo videos and bg videos taken with consenting clients. You can see everything my clients see, then imagine what you would do with me!",
        "I will create one custom video for everyone that registers. Email me after your access is approved if you have a specific outfit request or something you really want to see in your video.",
        "Because of the adult nature of the content, stripe doesn\u2019t allow cc payments so payments must be made through Zelle, CashApp, Venmo, PayPal, or Apple Pay. The number for all of those is 469-274-7852. Once payment is received, your access will begin. It\u2019s a one time payment for lifetime access!",
        "It\u2019s a great deal, so check it out. I did the whole thing, like this whole website, myself so if it doesn\u2019t work, let me know. We\u2019ll call it beta testing."
      ],
      img: "/images/blog/good-stuff.jpg",
      imgAlt: "Elegant portrait teasing the members-only gallery."
    },
    {
      slug: "touring-colorado-sept-7-12",
      title: "Touring Colorado Sept 7-12",
      date: "2026-07-29",
      category: "touring",
      answer: "I am touring Colorado September 7-12, 2026, starting in downtown Denver. Touring rates apply, pre-booked appointments get a $40 discount, and outcalls beyond 40 miles carry a two-hour minimum.",
      body: [
        "Hi everyone! I have decided that my next tour will be the beautiful state of Colorado. I\u2019ve heard great things about the clients there and the natural beauty will be a much needed relief from the ocean of concrete Dallas is floating on. I haven\u2019t seen a mountain in years!",
        "I am spending my first couple of days in downtown Denver, then I will see where the adventure takes me. I am even considering getting a job at a local strip club so I can strut around in my sexy outfits. I am not a great dancer but I still think I can pull it off.",
        "I will be there from September 7-12 and my touring rates will apply. I will offer a $40 discount for anyone that pre-books an appointment so call and schedule your visit today.",
        "Colorado is a big state. I will be providing outcall service anywhere, but anything further than 40 miles away will have a two-hour minimum requirement to book.",
        "I\u2019m so excited! Any information or advise you can provide about the area or advertising will be greatly appreciated."
      ],
      img: "/images/blog/garden-of-the-gods.jpg",
      imgAlt: "Garden of the Gods rock formations under a Colorado sky."
    },
    {
      slug: "how-to-contact-your-escort",
      title: "How To Contact Your Escort",
      date: "2026-07-26",
      category: "client-guides",
      answer: "Introduce yourself with a name, say where you saw her ad, and state your preferred date, time, and incall or outcall. One complete first message gets the fastest positive response from any provider.",
      body: [
        'I\u2019m so fortunate to be contacted by clients on a regular basis. Although I have the experience to navigate a call no matter how it is initiated, many providers are less experienced, and many are not as patient. What you say in that first call or text can determine if and how a provider responds. Simply texting "Hello" or "Are you available?" is the least likely way to get a response. It is vague and difficult to respond to effectively. Here is how you get providers to respond positively and schedule an appointment.',
        "Introduce Yourself: Start by telling her your name. Frankly, it doesn\u2019t have to be your real name. She isn\u2019t using her real name, you don\u2019t necessary have to either if you wish to remain anonymous. Some providers require a photo of your ID. To me, this is asking way to much and you shouldn\u2019t do it, but if she does ask and you want to do it, let her know the name you gave is one that you use for hobbying and tell her your real one. Most girls don\u2019t ask for this, so whatever name you give is acceptable. Use the same name for all providers in case you need a reference. Introducing yourself will make you seem more serious and also allow her to easily add you to her schedule. It\u2019s also the polite thing to do.",
        "Tell Her Where You Saw Her Ad: After asking a clients name, this is always my next question. This is because some girls have different information on different ads, particularly pricing. Telling her where you saw her is lets her know what information you are responding to.",
        'Give Her Information About Your Desired Appointment: Just asking "Are you available?" can turn some girls off. It requires a lot of follow-up questions. Ask her if she is available for incall or outcall, whichever you prefer, at a specific date and time. If you desire outcall, let her know the general area.',
        'Your Ideal introduction should look like this: "Hello, my name is_. I saw your ad on_. Are you available for an incall/outcall to_ on (date) at (time)?" Super simple right? This saves so much time and back and forth.',
        "If your girl requires references, provide that information as well and please reach out to your references and let them know you are using them! Ladies call me often for references and I have no idea who they are talking about. I don\u2019t save every clients number and even if I don\u2019t know you guys by your name and number. Give your reference a heads up. Let her know who you are so she is prepared when your provider reaches out to her.",
        "Final thought: I am not trying to tell anyone what to do or how to do it. I am just providing some information that can make contacting your escort easy and most likely get a positive response. We are on constant alert for time-wasters and will stop corresponding the moment we sense you are one. It\u2019s ok to ask questions and it\u2019s ok not to be 100% sure you want to see the lady you are calling, but keep in mind that the goal of the conversation is to set an appointment.",
        'As I said in my "How to Choose the Right Girl" post, you can tell a lot about a girl by how she responds to what you say. You really should be saying the right things though. You can\u2019t blame even the best providers for negative responses if you are not calling her for the right reason. She knows almost immediately when you are full of shit (at least I do). The best you can do is to be a good quality client from start to finish. I will end by saying that I appreciate that so many of you do just that.'
      ],
      img: "/images/blog/contact.jpg",
      imgAlt: "A phone on a nightstand, ready for a first text."
    },
    {
      slug: "behind-closed-doors",
      title: "Behind Closed Doors",
      date: "2026-07-16",
      category: "morgans-voice",
      answer: "Behind Closed Doors is my long-term goal: a lingerie store in Dallas, funded by my own savings, built carefully with small-business advice before a single penny is spent.",
      body: [
        "Thanks to your generosity and support, a girl can dare to dream. I have always loved lingerie. You can tell by my photos I have quite an extensive collection and I am always on the lookout for more. Dallas is a little lacking in that department so I have decided to open a store myself. It will be called Behind Closed Doors, a little nod to you all and how I was able to make it happen. This is a long term goal. At the earliest, it won\u2019t be until next year.",
        "I want to have $50,000 of my own funding to start. I am half way there but I know the next $25,000 won\u2019t be so easy to come by. I am not the new girl everyone has to see anymore. Had I have though of this 6 months ago, I would have that now easily. I am taking the first steps, which are to educate myself and use local resources like the Chamber of Commerce to connect with people that specialize in opening and managing small businesses. I am not spending one penny until I feel sufficiently educated about about operations and accounting.",
        "Retail is an extremely risky business and I am well aware that I will need to take on debt to open the store I envision. Everyone has high hopes when they open their own business but they quickly sink under the weight of reality. The odds are not in my favor but with some careful planning and advise from people that know what it takes to open a business, I might be able to beat those odds.",
        "This is not a sexy post. It doesn\u2019t have any valuable information about the business. It\u2019s a goal for me to focus on, a next step for me to work toward. We are always at our best when we are working toward a goal. I am not going to be a hottie with a body forever, or even much longer. The idea of finding a man to marry...doesn\u2019t appeal to me. Maybe one of you will change my mind but I haven\u2019t met him yet.",
        "I need all of the help and advise I can get so if you have anything valuable to share that might help me navigate this journey (beyond basic stuff) I would love to here it and your life will be fuller for having helped a hooker with a dream."
      ]
    },
    {
      slug: "role-play-scenarios",
      title: "Role Play Scenarios",
      date: "2026-07-02",
      category: "client-guides",
      answer: "Role play brings fantasies to life during a session. Classic scenarios include boss/employee, housekeeper/homeowner, cop/criminal, and random-meeting setups like a bar hookup. Always agree on the scenario with your provider first.",
      body: [
        "Role play is how you use hobbying to make your fantasies come to life. We all have sexual fantasies and some unfortunate souls will die only having mastrubated to them. You shouldn\u2019t be one of them. Most providers (I think) are happy to indulge in safe, non-threatening role play. You should come up with your own ideas but here are some fun basics for you to build on.",
        'DOM/SUB Role Play: scenarios in which one party is in a clear dominate position and uses it to "manipulate" the sub to do what he/she wants. Remember you can be the DOM or the SUB in these scenarios. I\u2019m going to word them as though you, the client are the DOM (because that\u2019s what I prefer) but switch them sometimes to add some spice.',
        "Boss/Employee: Classic role play. I like one where I am the office slut and you, my boss has to talk to me privately about always being in the men\u2019s room or the mail room with my coworkers and also never wearing panties or a bra to work. If I want to keep my job, I have to do even more for you than I do for my coworkers. You are the boss, after all.",
        "Housekeeper/Homeowner: Your wife is away on business and she mentions that the housekeeper will be coming by one morning. When you answer the knock at the door, you are shocked to see a sexy girl in short shorts and a crop tank top, cleaning supplies in hand ready to do her duties. You watch her wipe the counters and bend over to pick things out of her supply box. She keeps looking at you as well. You approach her to see if knob polishing is on her list of duties.",
        "Student/Teacher or Guidance Counselor: I like guidance counselor for this one. You are in your office alone with a student (an 18 year old senior of course). The school has tried everything to get her to change her promiscuous ways. Now you are talking to her and she is telling you about her latest naughty escapades and you are getting a little turned on. She notices your pants rising and asks if she can do anything to help.",
        "Loan Shark/Debtors Wife: This ladies husband is a deginerate gambler and he has nearly bankrupted their family. The wife has decided to take matters into her own hands and come to you, the loan shark, to see if there is anything she can do to pay off her husbands debt. You know she doesn\u2019t have the money, but there is something she does have that you are very interested in.",
        "Cop/Criminal: Not every lady will be down for this. Even pretend cops are unnerving for a lot of us, but to pretend you are a cop there to bust her unless she does whatever it takes to make it go away. That\u2019s sexy. You can even use handcuffs!",
        "Master/Slave: This one is quite controversial and sure to offend any black client or provider that is reading this but I have a fantasy being someone\u2019s slave used only for sex. This doesn\u2019t have to be a black/white thing. I just like the idea of being told what to do and having to do it. I have never done it, but I know there is someone daring enough to do this. Be ready with some really naughty things for your slave girl to do. (If you want to do this one with me, I will love it but it will still cost a total of 750/hr.)",
        "RANDOM MEETING role plays are ones where you and your partner go out somewhere and pretend not to know each other. I\u2019m only going to list a couple but they are fun and it\u2019s easy to put your own twist on them.",
        "Random Bar Hookup: Simple, your girl is sitting at the bar and you sit next to her. Maybe you are both in town for a conference and staying at the same hotel. You two start talking and the conversation gets personal. You wonder why this stranger is telling you she hasn\u2019t fucked her husband in 4 months. You invite her up to your room certain she will say no but she says yes and then the fun begins.",
        "Street Pick Up: This one is for me too. I have always fantasized about being a street walker. Wearing something skimpy and walking down the street, getting picked up by a stranger and fucked in the back seat of a car. It\u2019s definitely one for the daring. (This is another one I would love to do. It will cost $500/hr.)",
        "I can think of a lot more but I think that is a good start. Maybe something here will spark a fantasy for you and you can create your own role playing scenario. Ask your provider. She may have some great ideas as well. The possibilities are endless. I know most of the time a good GFE session is all that you want, but this is a great way to mix it up a bit and make your hobbying more fun and memorable."
      ]
    },
    {
      slug: "tips-to-ensure-a-great-session-2",
      title: "Tips to Ensure A Great Session",
      date: "2026-07-01",
      category: "client-guides",
      answer: "Show up clean and on time (never early), handle the donation first thing, be genuinely kind in the vulnerable minutes after, and never waste her time with vague texts. Courteous clients become favorites.",
      body: [
        "I have posted a lot about my job as an escort and what you should expect from me and my counterparts, now I am going to tell you a few things that I hope will make you a better client. The kind that us girls get excited to see. My favorite clients have not been the best looking or the richest. They have been the most courteous and comforting. They have been the ones I can tell thought of me before the session and where genuinely happy to see me. That happiness is infectious.",
        "I\u2019m not saying this is guaranteed to make all of the hoes love you, but if you follow these simple steps, at least we won\u2019t hate you and for some girls (not myself, I love all of my clients), that may be as close as you are going to get.",
        "Arrive to Your Appointment Clean and Fresh: This is rule number 1. Don\u2019t ever forget it. If you are coming from work and not feeling fresh from the shower fresh, your lady will likely have a shower you can use. There is nothing better than fresh, good smelling balls and nothing worse than musty, sticky ones. If you\u2019ve ever gotten a bj where she didn\u2019t want to go past the tip or stay down there for long? Your dick was probably musty. To me, it\u2019s a sign of disrespect for someone to show up smelling bad. This is the most important thing you can do to ensure your session goes how you want it to.",
        "Arrive On Time: Everyone\u2019s time has value. Nobody has time to sit and wait for someone that has demonstrated a lack of awareness of that. I will admit that we providers are a late bunch. That doesn\u2019t mean you should be. DO NOT ARRIVE EARLY! I can\u2019t stress this enough. 5 minutes before a call I am finishing my makeup, probably naked and talking on the phone with my girlfriend. I can\u2019t hear from you saying you are here. If you arrive early, wait until your appointment time to call.",
        "So don\u2019t come late and don\u2019t come early. Get there on time. We see you are the responsible ones, the reliable ones, the grown-ups. What is the hallmark of a responsible, reliable grown-up? Punctuality. If nothing in your girls day is happening on time, you are. It let\u2019s us know we can trust you. Nobody\u2019s perfect and life (and traffic) happen. In those cases tell your lady as promptly as possible and keep her posted. It\u2019s just a matter of respect for our time.",
        "Get the Money Out of the Way First: I have had good experiences in the business so I am a little more trusting of my clients but it is best to get the money part handled as quickly as possible. You don\u2019t know if your girls past experiences have left her distrusting. If it\u2019s cash make sure it is in sight and she sees it. If you are using an app, be sure the payment went through.",
        'If you are dealing with a lady you feel may be sketchy, or who you may not enjoy being with, do half up front and half in the end. Then figure out quickly if you want the appointment to continue. Don\u2019t get half way through and suddenly want to bail. That\u2019s way to much of an asshole move for any of you guys I\u2019m sure. Just remember, "purse first".',
        'Be Cool/Relate to Her: I think I may have mentioned this in my "Overnight" post as well. That\u2019s because it\u2019s important. The sex is great but the few minutes spent talking afterward is a very vulnerable time. We talk about things. You and your provider likely lead very different lives and she may be having financial trouble or boyfriend trouble or legal trouble or maybe all three. If she shares something you really can\u2019t relate to, try putting yourself in her shoes. Have a little empathy. Her troubles are not your troubles. You are leaving in 10 minutes. While you are there, be a source of comfort and support for her, as she should be for you.',
        "I, and a lot of the ladies I know, am a pro. You will never hear me talk about my personal problems on a call. I am well aware that is not what we are there for. However, I know which of my clients I could talk to if I needed to and they are my favorites. Just be truly non-judgmental. That\u2019s the key to being every girls ATF.",
        'Don\u2019t Waste Her Time: Ok, this is just me venting and you will have to excuse my language. Don\u2019t be a bull-shitting pussy-footer. Don\u2019t contact your lady unless you have a date and time in mind. For God sake\u2019s do not ask "when is good for you?" I\u2019ve never gotten that question right. Your initial contact should include: your name, where you saw her ad, whether you are looking for incall or outcall (if out, to what area), for how long and when. You are a perfect client. If your lady is available for all of that, now you are free to discuss things you would like to see and do during your call.',
        "Get Everything You Want: If you have a fantasy about how this appointment, an ideal way for it to go in your mind, share it with your provider. Do you want her to be doing in home yoga when you walk in? Do you want her to arrive at your outcall in business attire like the ladies in your office wear? Do you want FF to CIM? Tell her!! You can make this call into anything you want. Be creative. If your lady is down, she is probably happy to do something she knows will make you happy. Having someone think and fantasize about us is a huge turn-on. You are sure to turn up the heat of any session."
      ]
    },
    {
      slug: "tips-to-ensure-a-great-session",
      title: "How to Choose the Right Girl",
      date: "2026-06-21",
      category: "client-guides",
      answer: "Vet a provider before you call: google her phone number, read her ads and bio, gauge her tone in the first reply, skip deposits for local meetings, and trust your instincts.",
      body: [
        "Although many of us get into sex work because we think it will be easy money, the quality girls soon learn that we (as independents) have to wear a lot of different hats including: marketing/advertising, media production, booking, customer service, and driver. All that is in addition to our responsibilities like maintaining a good appearance and clean, safe incall location. It\u2019s not as easy as selling sex. I always said that when a client knocks on my door, my work is done.",
        "There are many providers out there that have mastered all of the skills above and take care of all of their responsibilities. There are many more that have not. This is a business full of bad actors, scammers, and half-steppers. The tips below are designed for you, the client, to gain an increased ability to spot the good providers and avoid the bad ones. In my experience, your decision to see a provider is a much bigger risk to you than it is to her. That\u2019s why it\u2019s your responsibility to be smart and careful. I know you are doing most of the thinking with your d*(k, but when it comes to your money and your safety, let your brain in for a moment during your selection process.",
        "Do Your Homework: If you see a woman on Tryst or Eros or anywhere that you are interested in google her phone number. Google mine. I just changed it so it won\u2019t show as much as my old one, but something will come up. Real escorts advertise in more than one location. You can also find many on social media, particularly Twitter. If nothing pops up, call at your own risk.",
        "Look At Her Advertising: Does it look like she put some thought and effort into it? Does it tell you what you need to know? Are the pictures flattering and pretty? Eros is great for me, but for you guys it\u2019s weird because there is an option to have no bio at all on your ad. Just a pretty picture and a phone number. I would want to get a feel for a lady\u2019s personality before I call her. On other sights, read her bio. Is it informative and inviting or a cold list of rules and restrictions. Boundaries are important, but if a girl has a long list of no\u2019s or will only see a certain type of client, she is no fun.",
        'Listen For The "Hello": I know we barely call each other anymore, but it\u2019s a similar concept through text. If you call, does she answer with a cheerful "Hello" or does she sound like you are bothering her? In text, is she quick to respond with a positive tone? I\u2019m not saying to expect an immediate response. Even the best of us get busy and miss a text, but does she get back to you? Does she act like she wants your business? The initial conversation is a strong indicator of how your experience will be with her.',
        "Don\u2019t Do Deposits: Ok, the exception is when you want an outcall that is further than say 40 miles away or you are booking overnight. If a girl asks for a deposit for an incall or an outcall to Plano, she probably just wants that little bit of money and will ghost you. I understand the reasoning behind deposits but good providers know how to target advertising to attract trustworthy clientele that will be where they say they will. A deposit isn\u2019t necessary. You will show because you want to see us.",
        "Trust Your Instincts: If you contact a lady and the conversation feels off or impersonal, or you hear a lot of people in the background, or she wants an excessive amount of information, or anything strikes you as odd, don\u2019t ignore it. When done right, an experience with an escort can be incredible but there is a lot of danger on both sides. In my opinion, it\u2019s more dangerous for you than it is for us. There are some wild women out there with wild friends that get wild ideas. I know part of the appeal is the sense of danger, but you don\u2019t want any actual danger. Be smart and have fun!"
      ]
    },
    {
      slug: "sex-worker-rights",
      title: "Sex Worker Rights",
      date: "2026-06-18",
      category: "morgans-voice",
      answer: "I started the Dallas branch of SWOP, the Sex Workers Outreach Project. Full decriminalization is unlikely, but small improvements in health, safety, and community resources make the work safer for everyone.",
      body: [
        "At one point during my career as a sex worker, I was an active advocate for decriminalization and the rights of sex workers everywhere. I even started the Dallas branch of SWOP, the Sex Workers Outreach Project. There are small branches all over the country and some have become valuable resources for information and connection. SWOP Dallas didn\u2019t really take off like that. We are sex workers (especially independents) are not the most trusting or eager to work against unsurmountable odds to achieve what exactly?",
        "Sex work will never be decriminalized. The stigma that has existed since the beginning of time isn\u2019t going away. It will never considered acceptable by society. So why did I bother? I did it because even though big changes are a long way away, small things can be done to improve conditions for sex workers, therefore improving conditions for the clients we serve, which improves the condition of society as a whole.",
        "Sex work will never go away. It\u2019s all human nature. Women do not desire sex for pleasure the way men do. We want to reproduce, we want to feel sexy and act sexy and sometimes we do want sex...just not like you. For you it\u2019s therapeutic, it\u2019s exciting, it stimulates some of the deepest parts of you. You need it and we can take it or leave it. Because of that gap between men and women, sex workers have always been and will always be. It is important and valuable work but laws and stigma have pushed it into the shadows were it is dangerous and shameful.",
        "Little things can be done to improve the health, living conditions and mental well-being of sex workers. Community and access to legal, health and social resources can be life changing for a lot of women in the industry. Every happy, healthy sex workers that feels valued and supported has the power to improve lives by creating more productive, less stressed, more focused men.",
        "Criminalization attracts bad actors and repels good ones. It takes money and resources away from catching people that are actually hurting women. It makes it hard for women to transition out of the industry.",
        "This is not sexy content and probably of no interest to most clients looking to book an appointment. It is just an important part of my job and I wanted to share it with you. This is not an easy job and any woman that does it is brave and bold and deserves, at least, your upmost respect.",
        "If any of my sisters are reading this post and are interested in restarting the Dallas chapter, reach out to me! Writing this post made me remember all the great work that can and should be done."
      ]
    },
    {
      slug: "optimize-your-overnight",
      title: "Optimize Your Overnight",
      date: "2026-06-08",
      category: "client-guides",
      answer: "A great overnight needs a plan that includes food, a clean space or a hotel, a small gift or flowers, and a clear conversation about what you want from the night. Do not book a first meeting as an overnight.",
      body: [
        "An overnight is expensive treat for anyone. It can run you anywhere from $500 to $5,000 to spend the night with a provider. Ideally, the girl you chose for this will understand the assignment and bring her A game. I don\u2019t recommend doing an overnight with someone you have never met (although I will do them, so call me!). It\u2019s really risky and 8-12 hours can feel like a long time on both sides. Here are a few things you should know and can do to get the most out of that time.",
        "Plan: There is a big difference between spending the whole night with someone and the rest of a night with someone. If you are calling someone (hopefully me, don\u2019t pay attention to what I said earlier) at 1:30 am and you have to start getting ready for work at 7:00, you don\u2019t need much of a plan. You are an easy call. However, if you want to do a whole night with someone, starting at say 7:00pm, you need to have a plan. It\u2019s best if that plan involves food. Any call longer than 6 hours should have food at some point. The last thing you want to deal with is a hungry hooker. Make reservations somewhere. Find out what kind of food she likes and book the best one of those you can find. If she is coming to you, clean up your space. If you don\u2019t want to clean up, spring for a hotel room. If you don\u2019t want to clean up or go out, spring for a hotel with room service.",
        "On an overnight I had that I will never forget, my date for the evening got us ticket to Medieval Times! Then some lingerie shopping and back to room for fun. I was in a fantastic mood because it was a really fun night, so I made the rest of the night unforgettable for him. Due to some innovative planning on his part, he had an amazing overnight experience as did I.",
        "This is a special night (hopefully for both of you) and, like all special things, it takes thought and prep. You don\u2019t just show up and expect things to happen. You make them happen. A clean space and food may seem like small things, but they will make all the difference.",
        "Add Some Razzle Dazzle: Us ladies love to feel spoiled, like we are with someone that treats us right, even if it is only for a night. A small gift, flowers, or dinner at a fancy restaurant adds a thrill to the evening and makes it special. A small, but nice, piece of jewelry gives her something to remember you by. Something pretty and shiny is guaranteed to put a smile on your girls face.",
        "Get Everything You Want: If you want to be intimate 5 times during your overnight, don\u2019t be afraid to tell her. If you want to see a movie or to go dancing or bowling, by all means do it. Let her know what you expect from her for your overnight. How else will she know? The last thing either one of you want is for you to end the appointment disappointed.",
        "Embrace the Differences: The odds are that you and your chosen provider live two very different lives. She probably didn\u2019t grow up with money, probably didn\u2019t go to college, doesn\u2019t work a typical job, and generally doesn\u2019t have many of the same interests as you. That doesn\u2019t apply to everyone, hell most of it doesn\u2019t apply to me, but...odds are. Understand this and listen to her and have empathy. Ask questions. She will not reveal all of herself to you (hopefully she won\u2019t reveal all of that much), but embrace and enjoy what she does open up about. She will likely teach you an important lesson about something that you will never forget."
      ]
    },
    {
      slug: "provider-responsibilities",
      title: "Provider Responsibilities",
      date: "2026-06-05",
      category: "morgans-voice",
      answer: "A good provider owes you easy scheduling and prompt replies, impeccable cleanliness and grooming, strict health and safety standards, and a genuine friendly attitude every single appointment.",
      body: [
        "As someone that has chosen to work in this industry and has seen success from it, I feel as though I am responsible to provide a certain level of service to all of my clients. No matter the date, the time or the location, if I take your appointment these are some things you can expect from me and should expect from all providers.",
        "Easy scheduling and prompt response: We all have our screening methods and mine are based on experience and listening to what you tell me. I know how a good client will approach, converse, and schedule. Any deviation is a red flag for me. If you are a good client (which I assume you are), just reach out and talk to me. I do not require references or a deposit (unless it\u2019s an overnight or weekend trip). It helps if you are a member of a website like preferred411.com or ourhome2.net but its not necessary. Text me for fastest response. 469-274-7852",
        "Cleanliness and well-groomed appearance: I do a lot to maintain my appearance, from diet and exercise to my nightly 6 step skin care routine. It is a lot of work for me to be as beautiful of a woman as I think you deserve. I have a closet full of great clothes so I will always arrive looking stunning. If you come to me, expect me to have on something sexy for you. I SHOWER BEFORE EVERY CALL! I can\u2019t imagine seeing you not smelling and tasting my best. I hope you will grant me the same courtesy. If you are coming to me, I have a shower available. If I am going to you, you have a shower available. I do my best work with a partner that smells good and tastes fresh as well.",
        "Health and safety standards: It is probably the most important responsibility I have to ensure that you and I both leave our appointment as healthy as we were when we came in. I have healthcare and I go to the gynecologist regularly so I know that I am free of any STDs. I practice safe sex. Please don\u2019t ask for anything else.",
        "A friendly attitude and good personality: [continue reading on the original post]"
      ]
    },
    {
      slug: "why-i-am-an-escort",
      title: "Why I am an Escort",
      date: "2026-06-03",
      category: "morgans-voice",
      answer: "Because it pays better than any other job I could get, I set my own hours, and I genuinely love the work: looking pretty, making clients happy, and enjoying real financial security for the first time.",
      body: [
        'The easiest answer to that question is because it pays more money than any other job I can get...like a lot more. It is nice to be able to afford things I want and pay my bills and still have money left over, and to have a growing savings account. I took a few years off and worked as a bartender/waiter and I got by just fine, but now I am doing better than "just fine". I have security and I make my own hours and I don\u2019t answer to anyone. That\u2019s the real answer. Plus, my job is to look pretty and make you happy. When you are with me, the whole world melts away and it\u2019s just us. I love the time I spend with my clients. I love the look on their faces when they see how hot I am and realize they get to touch me. I love knowing I am the only thing on their mind when I wrap my hands around...them;). It\u2019s fun and sexy and I enjoy it very much.',
        "I\u2019m really enjoying my life right now. I am making great money doing something I enjoy. That\u2019s the goal and that\u2019s why I am an escort."
      ]
    },
    {
      slug: "why-all-the-diy-pics",
      title: "Why All The DIY Pics?",
      date: "2026-06-01",
      category: "morgans-voice",
      answer: "I shoot my own photos because they show the real me: no photographer pressure, no condescension, just my personality in my own home. Every element of this site is made by me for you.",
      body: [
        "I am sure you have noticed that I do not use professional photos on my site. It\u2019s not because I am not a professional photo quality escort. I used pro photos almost exclusively for many years. What I found was that some photographers where great at capturing my beauty, suggesting creative poses and ideas, and making me feel comfortable as a paying client (I never did trades. I wanted the best), and others where not so great at those things.",
        "This time around, rather than dealing with a condescending photographer after spending hundreds of dollars on the right outfits and location, I just buy lingerie that I like and take photos in the comfort of my own home. I feel like these photos are more of an expression of my personality. You look in my eyes and don\u2019t see worry about getting the next shot right. You see that I am wild, sexy and fun. You also see that every element of this site, photos included is made by me for you!"
      ]
    },
    {
      slug: "dc-tour",
      title: "Washington DC Tour",
      date: "2026-06-01",
      category: "touring",
      answer: "I toured Washington DC June 16-21, staying in Dupont Circle. Despite 8 no-call-no-shows on day one, the trip turned into one of my favorites: a gorgeous, walkable city and a profitable week.",
      body: [
        "Hi guys, I am bringing all of my southern charm and hospitality to you this month. I know you guys are stressed up there and I would love to provide some relief. More than any other city, I have to guarantee you that everything we share and do is completely confidential.",
        "I will be there from June 16-21, staying in the Dupont Circle area then reassessing whether another area may be more convenient for you, my clients. I plan to see the sights, visit the museums, and enjoy DC\u2019s renown food and nightlife scene.",
        "If you would like to spend an afternoon showing me the best DC has to offer, I can offer you a special rate, you would be my escort and companion and that would be much appreciated.",
        "From DC update (this is probably TMI, but if you\u2019ve read this far, we are already friends): I hate it here. Every single appointment I scheduled the prior week, not only flaked, but didn\u2019t even call me to let me know. It was the absolute worst first day of travel I have ever experienced. I had 8 ncns (no call no shows)! That is unheard of. I would have gone home yesterday but someone gave me a deposit for a Saturday appointment. I\u2019m stuck.",
        "I still have hope though. I have two full days left and a gut feeling that this will turn out to be a great trip. Plus I need to go see the sights! For all of you that ncns\u2019d on me yesterday, it\u2019s your loss. I am great and you will never have another opportunity to meet me again. Also, I hope you stub your toe on your coffee table!",
        "Anyway, it\u2019s a new day and I have a room with a big tub so I\u2019m gonna have a soak, do a call (maybe...finally) then go out and see what Georgetown has to offer. I\u2019ll let you know how everything turns our when I get back home.",
        "DC Summary: I actually ended up loving DC. The city was absolutely gorgeous. Walkable, friendly, lively. I made a titty profit and had a great time. Even though my pre-books didn\u2019t show, I got enough business there to make it a good trip. Plus I saw the African American museum and the Jefferson Memorial (from across the street). I think I saw a little bit of the White House. Everything is always better in our memories than it was when it was actually happening. Thanks DC for an exciting, unpredictable and unforgettable experience."
      ]
    }
  ]
};

// api/admin.js
async function onRequest(context2) {
  const { request, env: env2 } = context2;
  const url = new URL(request.url);
  const model = url.searchParams.get("model");
  const action = url.searchParams.get("action");
  if (action === "export") {
    return await handleExport(env2);
  } else if (request.method === "GET") {
    return await handleGet(env2, model);
  } else if (request.method === "POST") {
    try {
      const body = await request.json();
      if (body.action === "save") {
        return await handleSave(env2, body.data);
      } else if (body.action === "publish") {
        return await handlePublish(env2, body.data);
      } else {
        return Response.json({ error: "Invalid action" }, { status: 400 });
      }
    } catch (e) {
      return Response.json({ error: "Invalid JSON: " + e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
}
__name(onRequest, "onRequest");
async function handleExport(env2) {
  try {
    const result = {};
    let value = await env2.TEM_USERS.get("admin:site");
    result.site = value ? JSON.parse(value) : site_default;
    value = await env2.TEM_USERS.get("admin:rates");
    result.rates = value ? JSON.parse(value) : rates_default;
    value = await env2.TEM_USERS.get("admin:tours");
    result.tours = value ? JSON.parse(value) : tours_default;
    value = await env2.TEM_USERS.get("admin:posts");
    result.posts = value ? JSON.parse(value) : posts_default;
    const pending = await env2.TEM_USERS.get("admin:publish_pending");
    result.publishPending = pending ? parseInt(pending, 10) : 0;
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: "Export failed: " + e.message }, { status: 500 });
  }
}
__name(handleExport, "handleExport");
async function handleGet(env2, model) {
  const available = ["site", "rates", "tours", "posts"];
  if (model && !available.includes(model)) {
    return Response.json({ error: "Invalid model" }, { status: 400 });
  }
  try {
    if (model) {
      const value = await env2.TEM_USERS.get("admin:" + model);
      if (value) {
        return Response.json(JSON.parse(value));
      } else {
        if (model === "site") {
          return Response.json(site_default);
        } else if (model === "rates") {
          return Response.json(rates_default);
        } else if (model === "tours") {
          return Response.json(tours_default);
        } else if (model === "posts") {
          return Response.json(posts_default);
        }
      }
    } else {
      return Response.json({ models: available });
    }
  } catch (e) {
    return Response.json({ error: "KV error: " + e.message }, { status: 500 });
  }
}
__name(handleGet, "handleGet");
async function handleSave(env2, data) {
  try {
    if (data.site) {
      await env2.TEM_USERS.put("admin:site", JSON.stringify(data.site));
    }
    if (data.rates) {
      await env2.TEM_USERS.put("admin:rates", JSON.stringify(data.rates));
    }
    if (data.tours) {
      await env2.TEM_USERS.put("admin:tours", JSON.stringify(data.tours));
    }
    if (data.posts) {
      await env2.TEM_USERS.put("admin:posts", JSON.stringify(data.posts));
    }
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: "Save failed: " + e.message }, { status: 500 });
  }
}
__name(handleSave, "handleSave");
async function handlePublish(env2, data) {
  const saveResult = await handleSave(env2, data);
  if (!saveResult.ok) return saveResult;
  try {
    const timestamp = Date.now();
    await env2.TEM_USERS.put("admin:publish_pending", timestamp.toString());
    return Response.json({ success: true, publishedAt: timestamp });
  } catch (e) {
    return Response.json({ error: "Publish flag failed: " + e.message }, { status: 500 });
  }
}
__name(handlePublish, "handlePublish");

// api.js
async function onRequestPost(context2) {
  const { request, env: env2 } = context2;
  const url = new URL(request.url);
  const form = await request.formData();
  const json = Object.fromEntries(form.entries());
  if (url.pathname === "/api/register") {
    return handleRegister(json, env2);
  }
  if (url.pathname === "/api/login") {
    return handleLogin(json, env2);
  }
  if (url.pathname === "/api/appointment") {
    return handleAppointment(json, env2);
  }
  return new Response("Not found", { status: 404 });
}
__name(onRequestPost, "onRequestPost");
function fail(msg, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status,
    headers: { "content-type": "application/json" }
  });
}
__name(fail, "fail");
async function pbkdf(pw, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 1e5 }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(pbkdf, "pbkdf");
async function handleRegister(j, env2) {
  const u = String(j.username || "").trim();
  const e = String(j.email || "").trim().toLowerCase();
  const p = String(j.password || "");
  const p2 = String(j.password2 || "");
  if (u.length < 3) return fail("Username must be at least 3 characters.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return fail("Enter a valid email.");
  if (p.length < 8) return fail("Password must be at least 8 characters.");
  if (p !== p2) return fail("Passwords do not match.");
  const id = "user:" + e;
  const existing = await env2.TEM_USERS.get(id);
  if (existing) return fail("An account with this email already exists. Try logging in.");
  const salt = crypto.randomUUID();
  const hash = await pbkdf(p, salt);
  await env2.TEM_USERS.put(id, JSON.stringify({
    username: u,
    email: e,
    salt,
    hash,
    created: (/* @__PURE__ */ new Date()).toISOString(),
    active: false
    // activated manually after $50 payment
  }));
  return new Response(JSON.stringify({
    ok: true,
    message: "Registered. Send the one-time $50 payment to 469-274-7852 (Zelle/Venmo/CashApp/PayPal/Apple Pay) and your access will be activated, usually the same day."
  }), { headers: { "content-type": "application/json" } });
}
__name(handleRegister, "handleRegister");
async function handleLogin(j, env2) {
  const id = String(j.user || "").trim().toLowerCase();
  const p = String(j.password || "");
  let rec = await env2.TEM_USERS.get("user:" + id);
  if (!rec) {
    const email = await env2.TEM_USERS.get("nameidx:" + id);
    if (email) rec = await env2.TEM_USERS.get("user:" + email);
  }
  if (!rec) return fail("Invalid credentials.", 401);
  const user = JSON.parse(rec);
  const hash = await pbkdf(p, user.salt);
  if (hash !== user.hash) return fail("Invalid credentials.", 401);
  if (!user.active) return fail("Membership not activated yet. If you have already sent payment, give me a few hours to activate it.");
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  await env2.TEM_SESSIONS.put("sess:" + token, JSON.stringify({ email: user.email, u: user.username }), { expirationTtl: 60 * 60 * 24 * 30 });
  const res = new Response(JSON.stringify({ ok: true, redirect: "/good-stuff/" }), { headers: { "content-type": "application/json" } });
  res.headers.append("Set-Cookie", `tem_sess=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`);
  return res;
}
__name(handleLogin, "handleLogin");
async function handleAppointment(j, env2) {
  if (String(j.captcha || "").trim() !== "15") return fail("Math check failed.");
  const req = {
    ...j,
    received: (/* @__PURE__ */ new Date()).toISOString()
  };
  const key = "appt:" + Date.now();
  await env2.TEM_USERS.put(key, JSON.stringify(req), { expirationTtl: 60 * 60 * 24 * 90 });
  return new Response(JSON.stringify({
    ok: true,
    message: "Request received. For fastest response, also text me at 945-397-2900. I will confirm within 24 hours."
  }), { headers: { "content-type": "application/json" } });
}
__name(handleAppointment, "handleAppointment");

// _middleware.js
var SITE_PASSWORD = "Nympho";
var COOKIE_NAME = "tem_gate";
var COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
var COOKIE_VALUE = "granted-9f2e7a1c";
function passwordPageHtml(errorMsg) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Password Required</title>
<style>
  html,body{height:100%;margin:0;}
  body{
    display:flex;align-items:center;justify-content:center;
    background:#0b0b0d;color:#eee;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  }
  .box{
    width:100%;max-width:340px;padding:2rem;box-sizing:border-box;
    background:#151517;border:1px solid #2a2a2e;border-radius:10px;
  }
  h1{font-size:1.05rem;font-weight:600;margin:0 0 1.1rem;text-align:center;color:#f2f2f2;}
  input[type=password]{
    width:100%;box-sizing:border-box;padding:0.65rem 0.75rem;margin-bottom:0.85rem;
    border:1px solid #3a3a3f;border-radius:6px;background:#0e0e10;color:#fff;font-size:1rem;
  }
  button{
    width:100%;padding:0.65rem 0.75rem;border:0;border-radius:6px;
    background:#e8336d;color:#fff;font-size:1rem;font-weight:600;cursor:pointer;
  }
  button:hover{background:#d12a5f;}
  .err{color:#ff7b7b;font-size:0.85rem;margin:-0.4rem 0 0.85rem;text-align:center;}
</style>
</head>
<body>
  <div class="box">
    <h1>This site is private</h1>
    <form method="POST" action="/__auth">
      ${errorMsg ? `<div class="err">${errorMsg}</div>` : ""}
      <input type="password" name="password" placeholder="Password" autofocus required>
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;
}
__name(passwordPageHtml, "passwordPageHtml");
function renderGate(errorMsg, status = 401) {
  return new Response(passwordPageHtml(errorMsg), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
__name(renderGate, "renderGate");
function hasValidCookie(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const idx = c.indexOf("=");
      if (idx === -1) return [c.trim(), ""];
      return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
    })
  );
  return cookies[COOKIE_NAME] === COOKIE_VALUE;
}
__name(hasValidCookie, "hasValidCookie");
async function onRequest2(context2) {
  const { request, next } = context2;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/admin")) {
    return next();
  }
  if (url.pathname === "/__auth" && request.method === "POST") {
    let submitted = "";
    try {
      const form = await request.formData();
      submitted = String(form.get("password") || "");
    } catch (e) {
    }
    if (submitted === SITE_PASSWORD) {
      const headers = new Headers();
      headers.set("location", "/");
      headers.append(
        "set-cookie",
        `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
      );
      return new Response(null, { status: 302, headers });
    }
    return renderGate("Incorrect password.", 401);
  }
  if (hasValidCookie(request)) {
    return next();
  }
  return renderGate(null, 401);
}
__name(onRequest2, "onRequest");

// ../.wrangler/tmp/pages-30VXsL/functionsRoutes-0.3739900933653908.mjs
var routes = [
  {
    routePath: "/api/admin",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest2],
    modules: []
  }
];

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-Adww3u/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../../../root/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-Adww3u/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.905286525273268.mjs.map
