# HTTP 请求客户端：使用与维护规范

## 契约与实施核对

本文维护本项目约定的 HTTP 契约。接入或修改前必须同时核对公开入口、内部实现及消费者，不能仅看到入口中列出名称就认定导出可用。名称、路径或能力不一致时明确记录差异，在任务授权范围内修复并验证；不得自动把本文的 `ApiError` 替换成仅在入口出现的 `HttpError`，也不得绕过公开入口深度导入。本文目录是约定结构，不表示当前承载 Skill 的目录已经包含完整可运行应用。

本文定义本项目统一 HTTP 请求客户端的目录结构、公开接口与维护规则，供开发者和 AI 长期参考。

业务开发只使用客户端公开能力。客户端内部由架构维护者或明确授权的任务维护，不因普通业务需求自行改动。脚手架通用工程要求遵循 Hermes；本文定义本客户端的公开契约，不从其他请求实现推定其认证或错误行为。

## 1. 目录结构

```text
src/infrastructure/http/
├─ index.ts        对外公开入口
├─ config.ts       网关、环境与请求默认配置
├─ client.ts       普通请求、地址拼接与公共解包
├─ upload.ts       上传，复用配置与公共处理
├─ control.ts      超时、取消与传输失败归一化
├─ transport.ts    传输端口 HttpTransport 与注册（registerTransport / getTransport）
├─ uni-transport.ts 基于 uni.request / uni.uploadFile 的真实传输
├─ testing.ts      测试用 Fake 传输（仅测试引用，不从 index 导出）
└─ errors.ts       请求错误类型与后端错误码
```

业务统一从 `@/infrastructure/http` 引用，禁止引用内部文件。目录中不另建后端名称子目录，也不在 shared 或顶层重复建立请求客户端。

## 2. 业务调用边界

- 客户端只在领域 `api/` 接口函数中调用；页面、组件和 composables 调用领域能力。
- 后端路径从领域 `api/endpoints.ts` 引用，业务接口逐个手写，明确参数、返回类型和网关。
- 业务代码不直接调用 uni.request、uni.uploadFile，不自行拼接后端域名。
- 传输和响应协议处理归客户端，业务模型转换与业务规则归领域。
- 客户端不依赖任何业务领域；身份能力通过应用组装层注册接入。

## 3. 公开接口与使用示例

index.ts 显式导出 `http`（get / post / getOptional / postOptional）、`uploadFile`、`rawRequest`（仅 shared/session/api 使用，ESLint 强制）、`createRequestController`、请求控制类型、错误类型、错误判断函数、token 和身份失效处理的注册函数，以及传输端口 `registerTransport` / `uniTransport` / `HttpTransport`（仅应用组装层与测试使用）。不提供 `apifm`、`apifmRaw`、`apifmUpload`、`ApifmRequestOptions`、`ApifmResponse` 与 `MOCK_ENABLED` 旧别名。配置、参数清理、地址拼接和内部解包函数不对业务公开。

```ts
import { http, uploadFile } from '@/infrastructure/http'
// E 来自领域 endpoints.ts，DTO 来自领域 models。

const list = await http.get<AddressDTO[]>(E.list)
await http.post(E.remove, { id })

const detail = await http.get<AddressDTO>(
  E.detail,
  { id },
  { gateway: 'common', allowEmpty: true },
)
// detail 的类型是 AddressDTO | null。

const file = await uploadFile(filePath)
const url = file.url
```

- get、post 默认返回解包后的 data。
- allowEmpty 为 true 时，仅将约定的暂无数据业务码转换为 null；返回类型必须包含 null。未开启时该业务码作为错误抛出。
- `http.getOptional` / `http.postOptional` 是 `allowEmpty: true` 的简写，返回类型包含 null；不再提供其他重复方法。
- 不将原始响应作为常规业务接口公开。确需检查登录等特殊返回码时，由领域接口明确表达结果；新增低层公开能力须经设计评估。
- 上传返回 `{ url: string, name?: string }`，领域可包装成只返回 URL 的能力。

## 4. 参数、网关与认证

- 默认 main 网关，其他网关由领域接口根据 endpoints 的登记显式选择。
- 请求默认使用 form-urlencoded 参数表达，特殊接口按明确契约处理，不自动猜测格式。
- 参数支持字符串、数字和布尔值，null、undefined 字段自动清理；对象与数组按接口要求序列化。
- 认证默认开启，只对配置的可信后端目标自动注入 token；非可信绝对地址不得携带自动认证凭证。
- token 默认通过注册的获取函数取得；显式参数 token 优先。auth: false 关闭自动注入，不代表自动删除调用方显式传入的 token。
- 默认超时及网关来源统一在 config.ts 定义。
- 上传有效期等参数由上传接口明确声明单位和取值，不向业务暴露不必要的传输细节。

## 5. 响应与错误契约

普通请求和上传采用一致的公共响应处理规则：先判断 HTTP 状态，再校验协议结构，最后解释业务码。上传先解析字符串响应，再进入公共处理。

- 响应协议为 `{ code, data, msg }`；code 为 0 返回 data。
- 业务码 700 表示暂无数据，仅在 allowEmpty 开启时返回 null。
- 业务码 2000 表示身份失效，调用统一处理器后仍抛出错误。
- 非成功 HTTP 状态、网络失败、结构异常和业务失败统一表达为 ApiError，并可区分错误类别。
- ApiError 提供 code、message、可选 data，以及适用时的 HTTP 状态；使用 isApiError 判断，不读取不存在的 msg 属性。
- 结构校验不替代领域 DTO 校验；上传成功结果需具备合法的 URL 字段。

客户端不默认弹出所有错误提示。领域与 UI 根据错误类别决定提示、降级或恢复，重要错误不能静默吞掉，技术错误文本不盲目原样展示给用户。

不默认自动刷新 token、跳转登录页或重放请求。这些能力只有在明确认证方案后才引入。超时不代表服务端未执行，创建订单、支付等写操作不得盲目自动重试。

### 请求控制与恢复

普通请求的 options 和上传第三个参数支持 `timeout`、`signal`。timeout 是 1 到 2147483647 的整数毫秒，省略时使用 config 的默认值；无效参数抛出 RangeError 且不发送。它限制传输等待，不包含收到响应后的身份处理。宿主没有回调时，客户端仍会在期限到达后释放等待并尝试 abort。

`createRequestController()` 返回 `{ signal, cancel }`。调用方将 signal 透传到领域 API，再传给 HTTP；模块卸载、查询被替代等场景调用 cancel。控制器一次取消后不能复用，也可用于取消一组请求。发送前取消不调用宿主；发送中取消中止任务，清理计时器和订阅，忽略晚到响应。收到传输响应后取消不撤销已开始的业务解包或身份处理。

```ts
// 领域 api 函数内部：options 使用 RequestControlOptions。
return http.get<DetailDTO>(E.detail, { id }, options)
// 上传仍兼容前两个参数。
return uploadFile(filePath, expireHours, options)
```

ApiError 保留 Network、Http、Protocol、Business 四大 kind。Network 的 reason 为 Timeout、Offline、Cancelled 或 Unknown；isCancelled 用于取消判断。超时由客户端期限或宿主超时报告确定，取消由控制器或宿主取消报告确定；其余传输失败只有当前网络快照明确 offline 时才表达 Offline，否则保留 Unknown。原始宿主错误保存在 data，技术文本不直接作为默认用户文案。

提示由一次用户操作的最外层 UI/领域交互入口拥有；API 层只抛错，中间层不重复弹窗。共享 showError 对取消保持静默，HTTP 和 Track 不提示。应用不因同一次断网额外弹全局 toast。

重试由调用方按操作性质选择，不能只按 GET/POST 判断。查询可按需设置有限次数、间隔和并发保护；写入超时、断网或取消都不证明后端未执行，应查询结果或依赖明确的后端幂等契约，再决定重发。HTTP 不自动重试。

网络状态通过 `@/infrastructure/network` 获取和订阅，详见 网络契约（项目根目录：`src/infrastructure/network/README.md`）。调用方负责取消订阅、前后台条件、恢复并发和旧结果保护。

## 6. 配置职责

学习项目通过 `VITE_DATA_SOURCE` 选择请求来源：`mock` 使用 本地 Mock 服务（项目根目录：`src/mock/README.md`），`real` 或缺省继续真实请求。当前 `env/.env` 默认配置 `mock`。修改后需重启开发服务或重新构建；切换时清理前端缓存并重新进入。

数据源通过传输端口接入：client 只依赖 `HttpTransport`，不感知 Mock。应用启动时 `src/app/data-source.ts`（全项目唯一允许引用 `@/mock` 的生产文件）按 `VITE_DATA_SOURCE` 注册 `uniTransport` 或演示传输，并通过 `shared/platform/overrides` 注册登录 code、会话校验和支付的替身。真实构建由 vite.config.ts 的 `resolve.alias` 把 `@/mock` 及其任何子路径解析到 `src/mock/disabled.ts`。演示传输仍走原参数清理、认证注入、响应校验和解包。未登记接口明确失败，不回退真实网络。上传在 Mock 模式返回本地文件路径用于预览；真实模式继续验证 HTTP(S) 文件 URL。平台登录和支付通过已有 device 端口接入模拟实现，业务 API 和页面不增加模式判断。

客户端不再导出 `MOCK_ENABLED`。业务代码不得按数据源分叉；某类后端服务是否接通用能力开关表达（`src/config/capabilities.ts`，如 `roleBackend` 对应 `VITE_ROLE_BACKEND_ENABLED`）。

config.ts 独立存在，集中管理 HTTP 专属配置：

- 网关地址及其环境变量读取。
- 默认请求超时，按需包含上传超时。
- 可信认证目标等客户端配置。

不放当前 token、登录状态、领域接口路径、页面配置或业务流程。商户 ID、子域等应用多处使用的配置归应用配置，由客户端读取，避免重复定义。

地址拼接和配置解析的执行逻辑保持明确，不将 config.ts 扩大为全项目配置集合。

## 7. 文件职责与依赖

### index.ts

公开接口的唯一入口，显式导出经过确认的能力。公开名称、参数、返回值与错误行为构成契约，修改时检查消费者。

### client.ts

负责地址拼接、参数清理、认证能力注册、请求发送，以及内部公共响应校验和业务解包。URL 与注册逻辑较小时不另外拆文件。

### upload.ts

负责本地文件、上传参数和上传响应解析，复用 config 和 client 的公共处理，不复制错误码与身份失效规则。

### errors.ts

负责请求错误、后端错误码与判断函数。错误类别区分网络、HTTP、协议和业务失败；无需为每一类建立独立错误类。与网络无关的领域规则错误不放进 HTTP 目录。

### control.ts

定义跨端取消信号和请求控制选项，统一处理传输期限、结束竞争与资源清理，通过网络快照细分传输失败；不处理认证、业务码、提示或重试。client 和 upload 共用此文件，不建立额外平台适配器。

### 依赖方向

```text
index  → client / upload / errors
upload → config / client 的内部公共处理 / errors
client → config / errors / control
upload → control
control → errors / network 公共入口
config → 环境变量与稳定的应用配置
```

内部不引用自身 index，不依赖 app 或业务领域，保持单向、无环。公共处理较少时留在 client，不为几行代码增加模块。

## 8. 应用能力接入

应用启动时注册 token 获取函数和身份失效处理器，由应用组装层连接领域与客户端。注册工作较少时放在 app/lifecycle.ts，不强制建立 registrations.ts。

- token 在发起请求时获取，避免长期缓存旧凭证。
- 身份失效处理需确认失败属于当前会话，防止旧请求清除新会话。
- 并发失效请求避免重复跳转和重复清理。
- 注册处理器不能掩盖原始请求错误；采用异步处理时明确等待和失败策略。
- 缺少注册时不伪造凭证，受保护请求应明确失败，不能宣称已经认证。

## 9. 维护与验证

- 网关、环境、超时与可信目标变化：修改 config，核对地址拼接及部署环境。
- 响应协议或解包变化：修改 client，核对 upload 是否仍使用同一公共规则。
- 上传方式变化：修改 upload，验证错误和身份处理的一致性。
- 错误表达变化：修改 errors，必要时由 index 显式导出。
- 公开契约变化：检查消费者，同步接口说明和调用方式。

代码变更按范围验证正常响应、空结果、身份失效、非成功 HTTP 状态、异常响应、网络失败、上传及凭证注入范围；认证变更验证并发失效和旧会话响应。工程检查遵循 AGENTS。

取消与超时由 control 提供，普通请求与上传统一观测结果；主动取消记录 outcome=cancelled，不调用 captureApiError。失败记录 kind、reason、code 和 statusCode。监控只记录，不参与恢复，始终保持客户端不依赖业务领域。

## 10. 多端适配要求

### 10.1 适用范围与默认实现

请求与文件上传必须满足本项目发布目标：微信小程序、抖音小程序、App，以及 uni-app 构建的 H5，包括 PC 浏览器访问。独立于 uni-app 的 PC Web 工程不默认具备 uni 运行环境，应按下一节接入浏览器传输实现。

默认由 uni-transport.ts 调用 uni.request 和 uni.uploadFile，client.ts 与 upload.ts 通过已有 transport.ts 端口发送，业务通过同一公开接口调用，不直接使用 wx、tt 或浏览器网络 API。统一 API 不代表所有参数和网络行为完全一致，必须验证实际目标端与运行版本。

- 小程序：分别配置请求和上传域名白名单，验证发布环境，不能只依赖开发工具忽略域名校验。
- H5 与 PC 浏览器：验证服务端 CORS 或生产同源代理、HTTPS 和必要的凭证策略；开发代理可用不代表生产可用。
- App：在真实设备验证网络、HTTPS 证书、超时和上传，不能只以浏览器或模拟器结果判断。
- 上传：各端本地文件路径、浏览器 File 对象及选择文件能力存在差异；默认使用 uni 支持的文件输入。新增浏览器实现时由统一上传契约明确表示支持的文件来源，不让领域到处判断平台。
- 认证：不同平台如何登录由身份领域处理；HTTP 接收注册的凭证能力，不在客户端实现微信、抖音等登录流程。

平台差异集中在基础设施内，遵循 Hermes 的条件编译规范。业务层保持统一的返回模型与错误语义。每个发布目标分别验证普通请求、上传、空结果、超时、身份失效和异常响应。

### 10.2 配置问题与传输能力缺口

先判断问题是否来自域名白名单、跨域、证书、网关、后端协议或身份接入。此类问题应在对应配置、部署或业务契约处解决，不能通过更换请求库或增加适配器绕过。

沿用已存在的 transport.ts 与 uni-transport.ts。只有确认 uni.request 或 uni.uploadFile 无法满足某个目标环境的明确需求时，才增加新的传输实现。例如独立 Web 工程没有 uni 环境，或 App 需要原生插件提供的特殊网络能力。记录缺失能力、受影响的平台和验证证据，再选择实现，不因为平台数量多就提前拆分。

## 11. 按需扩展：传输适配层

### 11.1 扩展位置

复用第 1 节的 transport.ts 契约与注册入口，以及 uni-transport.ts 默认实现，不再另建同用途的 transport/ 目录。若目标工程已按 core、pipeline、transports 等目录组织，先核实并复用其唯一传输边界，不为匹配示意树迁移成熟模块。

只有明确能力缺口时，才在已有传输实现所在位置增加 web-transport.ts 或 native-transport.ts。微信和抖音通常复用 uni 实现，不默认新增独立适配器。以下文件名描述约定职责，不要求创建占位文件。

### 11.2 文件职责

- `transport.ts` 的类型契约：定义最小必要契约，包括请求地址、方法、请求头、传输数据、超时、上传文件来源及原始结果。新增取消、进度等能力时明确支持范围，不预先设计完整网络框架。
- `transport.ts` 的注册与读取入口：应用组装层按构建目标注册实现，client 和 upload 读取实现。平台选择遵循条件编译或明确构建入口，不让业务指定适配器。
- `uni-transport.ts`：使用 uni 网络 API，作为 uni-app 各目标端的默认实现。底层调用集中于此，不在 client 或 upload 中重复发送请求。
- `web-transport.ts`：用于无 uni 环境的独立浏览器工程，或经过确认的浏览器专属需求；根据上传进度、取消等实际需求选择 fetch 或 XMLHttpRequest。浏览器实现仍受 CORS 等限制。
- `native-transport.ts`：用于 uni API 无法满足的 App 原生能力，通过明确的原生插件执行传输；不因存在 App 发布目标就自动创建。没有安装或不支持所需插件时明确失败。

### 11.3 职责与调用方向

```text
领域接口
   ↓
HTTP 公开入口
   ↓
client / upload：认证、参数、响应协议与业务错误
   ↓
transport：请求、上传及底层取消等传输能力
   ↓
uni API / 浏览器 API / 原生插件
```

transport 返回 HTTP 状态、响应头和响应体，报告传输失败，不解释后端业务码、不获取领域 token、不弹出 UI 提示，也不直接依赖业务或 app。上传的传输响应经解析后交由上层公共响应处理，保持普通请求与上传的错误及身份行为一致。

上层负责拼接地址、可信目标判断和凭证接入，再把明确参数交给 transport。各适配器不各自复制业务解包和身份失效规则。平台文件、二进制类型等差异只在统一传输契约和适配器边界处理，不扩散到领域。

依赖方向为 client/upload → transport.ts 端口；应用组装层 → 注册具体适配器；具体适配器 → transport.ts 类型契约；适配器不得反向引用 client、upload 或 HTTP 公开入口。transport 不重复管理网关配置。

### 11.4 选择、兼容与验证

- 选择依赖编译目标和明确能力，不使用散落的运行时平台判断。Web 构建不导入原生专属模块，小程序构建不导入浏览器专属实现。
- 适配器满足相同基础契约；超时、取消、文件输入及错误语义明确。不支持必需能力时明确报错，不能静默忽略或假装成功。
- 对外调用保持统一；仅更换传输实现时不改变业务返回模型。新增文件输入或可选能力若影响公开类型，应评估消费者并明确契约。
- HTTP 状态和响应头可见性等受平台限制的行为如实表达，不伪造底层未提供的信息。
- 为具体适配器验证请求、上传、异常状态、网络失败、超时及其扩展能力，并在对应目标端验证；不能只通过 uni 实现就推定其他实现正确。

扩展传输实现时同步维护本规范，使公开入口和实现约束一致；不修改业务领域去适应每个平台的网络 API。没有明确能力缺口时，继续使用现有结构，不创建 transport 目录或占位适配器。

公共响应信封类型定义在 src/infrastructure/http/response.ts，Mock 复用该类型。response-contract.test.ts 使用同一校验检查 Mock 与 HTTP 响应替身；这不证明真实后端业务字段，业务契约仍需后端资料或实际响应确认。
