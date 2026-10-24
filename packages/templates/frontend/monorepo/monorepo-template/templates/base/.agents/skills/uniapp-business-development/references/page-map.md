# 用户端页面职责与导航地图

> 适用范围：本项目的用户端及文末角色分包。以下页面、路由和行为保留其已记录的核实日期，不是对当前承载 Skill 的目录重新验收的结论。使用时核对实际页面与注册配置；项目源码路径均相对于目标应用根目录，缺失源码时标记待核实，不推测页面已存在。

核实日期：2026-10-10。范围：当前用户端 `src/pages/` 中注册的 36 个页面、5 个底部导航入口。依据：页面模板、关联 composables、公共导航、应用生命周期和生成后的路由配置。本文是静态代码核实结果，未进行真机、生产后台配置或支付联调，不把源码中的可选参数声明等同于实际可用入口。

本文仅供 AI 和开发者查阅，不被运行代码导入。目录规范见 [business-architecture.md](./business-architecture.md)，每个领域的后端数据参考仍放在其 `docs/db.md` 中。发生冲突时先核实实际代码、路由配置和后台契约，再更新本页，不据此擅自改业务逻辑。

## 1. 如何使用这份文档

- 找页面：按五个分类查阅第 4 节，每页记录职责、路由、入口、参数、会话要求、跳转和非跳转交互。
- 找目标：页面跳转逐条写明触发动作、完整目标路由、导航方式、参数与条件。
- 找流程：第 5 节串联关键使用链路；弹窗、支付、返回和分享不混写为普通页面跳转。
- 找依据：每页都有源码路径。参数缺失处理、后台动态链接和未确认回跳单独说明。

## 2. 目录、模块和实际页面

分类目录只组织代码，不新增页面或导出入口；业务模块保留自己的页面、API、组件、composables、models、公共入口、状态、测试和参考文档。`components/*.vue` 是组件，不计入页面。

```text
src/pages/
├─ home/
│  ├─ index/
│  └─ notice/
├─ ordering/
│  ├─ index/
│  ├─ goods/
│  ├─ goods-details/
│  ├─ shop/
│  ├─ cart/
│  ├─ pay/
│  ├─ payment/
│  └─ youhui-pay/
├─ queue/
│  ├─ index/
│  └─ booking/
├─ pickup/
│  ├─ index/
│  └─ order-details/
└─ account/
   ├─ index/
   ├─ ad/
   ├─ asset/
   ├─ orders/
   │  ├─ order/
   │  ├─ all-orders/
   │  └─ refund-apply/
   ├─ benefits/
   │  ├─ member-center/
   │  ├─ card/
   │  ├─ coupons/
   │  ├─ score/
   │  └─ sign/
   └─ services/
      └─ about/
```

- `ordering/payment`：支付公共能力与 PaymentPanel 组件，没有独立页面路由；不能跳转到 `/pages/ordering/payment/index`。
- `account/orders/order`：订单 API、类型和流程，没有独立页面路由；不能跳转到 `/pages/account/orders/order/index`。
- `pickup/index`：取餐首页入口，展示进行中的订单和取餐码。
- `pickup/order-details`：订单详情和扫码核销结果页面，供取餐及其他订单流程使用。
- `pages-shop/access/onboarding/index.vue`：公开入驻申请；旧 ordering/shop/join-apply.vue 只重定向。
- “我的”提供商家登录、商家入驻、骑手登录入口，对应 pages-shop、pages-rider 分包；角色后台真实服务暂未接通。

## 3. 全局入口和导航语义

### 3.1 五个底部导航入口

- 首页：`/pages/home/index/index`，底部导航使用 `switchTab`。
- 点餐菜单：`/pages/ordering/index/index`，底部导航使用 `switchTab`。
- 排队取号：`/pages/queue/index/index`，底部导航使用 `switchTab`。
- 取餐：`/pages/pickup/index/index`，底部导航使用 `switchTab`。
- 我的：`/pages/account/index/index`，底部导航使用 `switchTab`。

依据：tabbar.ts（项目根目录：`src/app/tabbar.ts`）、pages.config.ts（项目根目录：`pages.config.ts`）。首页使用 `definePage({ type: "home" })` 声明启动页面；上述五个入口在当前源码和生成配置中均存在。

### 3.2 公共导航与返回

依据：navigation.ts（项目根目录：`src/shared/platform/navigation.ts`）。

- `go`：目标属于五个 tab 时调用 `switchTab`，同时去除查询字符串；其他目标调用 `navigateTo`，携带编码后的查询参数。不能通过 `go` 给 tab 页可靠传递查询参数，当前部分状态通过共享 store 或存储传递。
- `redirect`：调用 `redirectTo`，替换当前页。
- `relaunch`：调用 `reLaunch`，清空页面栈后打开目标。
- `back()`：有上页时 `navigateBack`；没有上页时 `switchTab` 回首页。文中“返回调用页面”只指存在正常返回栈，不保证一定回到某个固定页面。
- “无固定业务页面跳转”指已核实的模板和调用逻辑中没有固定目标；不代表不能使用系统返回或全局底部导航。
- 分享和小程序码：生成接收者的页面入口，不让发送者立即进入目标页。

### 3.3 登录与应用级参数

依据：lifecycle.ts（项目根目录：`src/app/lifecycle.ts`）、shared/session（项目根目录：`src/shared/session/README.md`）。应用前台处理 `inviter_id`，保存邀请人；普通进入尝试恢复或创建会话，有效桌台 scene 留给桌台点餐流程处理。本项目没有单独登录页面路由。每页下面区分“显式门禁”“自动授权/重登”和“仅依赖当前会话”，不承诺登录一定成功。

## 4. 逐页说明

### 首页（2 个页面）

#### 首页 · `Routes.home`

- 文件：src/pages/home/index/index.vue（项目根目录：`src/pages/home/index/index.vue`）。
- 路由：`/pages/home/index/index`。类型：底部导航页。
- 职责：展示首页轮播、会员信息、配送方式和服务入口。
- 已确认入口：领取礼品卡。 默认启动页、底部导航；好友/朋友圈分享。
- 接收参数与上下文：无本页必需参数；分享附带 inviter_id，由应用前台生命周期统一处理。
- 登录/权限：本页没有显式登录门禁；用户信息依赖公共会话。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 会员信息入口 → **会员中心** `/pages/account/benefits/member-center/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 优惠券入口 → **优惠券** `/pages/account/benefits/coupons/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 选择自取或外卖 → **点餐菜单** `/pages/ordering/index/index`；方式：`go → switchTab`；参数：无；配送方式写入共享门店状态；条件：无额外前置条件。
- 关于我们入口 → **关于与内容单页** `/pages/account/services/about/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 透明食材入口 → **关于与内容单页** `/pages/account/services/about/index`；方式：`go → navigateTo`；参数：key=toumingshicai；条件：无额外前置条件。
- 礼品卡入口 → **礼品卡** `/pages/account/benefits/card/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。

动态/外部行为：轮播 linkUrl 经 openLink：小程序内路径使用 go；HTTP(S) 地址只在 H5 通过 window.location.href 打开，小程序端不跳转。目标由后台配置，无法静态列出。

返回行为：无自定义返回动作。

其他交互：语言选择弹窗；切换自取 zq / 外卖 kd 时先写门店配送状态。

分享/码入口：

- 好友/朋友圈分享 → 首页 `/pages/home/index/index`；携带 inviter_id。

逻辑依据：useHomePage.ts（项目根目录：`src/pages/home/index/composables/useHomePage.ts`）。

#### 公告详情 · `Routes.noticeDetail`

- 文件：src/pages/home/notice/detail.vue（项目根目录：`src/pages/home/notice/detail.vue`）。
- 路由：`/pages/home/notice/detail`。类型：普通页面。
- 职责：按公告 ID 展示公告富文本。
- 已确认入口：点餐菜单。
- 接收参数与上下文：id：内容查询必需；缺失时不发起详情请求。
- 登录/权限：没有本页显式登录门禁。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回动作。

其他交互：富文本展示；未绑定页面级富文本链接跳转，内容中是否包含外链待后台资料核实。

逻辑依据：useNoticeDetailPage.ts（项目根目录：`src/pages/home/notice/composables/useNoticeDetailPage.ts`）。

### 点餐（10 个页面）

#### 点餐菜单 · `Routes.order`

- 文件：src/pages/ordering/index/index.vue（项目根目录：`src/pages/ordering/index/index.vue`）。
- 路由：`/pages/ordering/index/index`。类型：底部导航页。
- 职责：组装门店、菜单分类、商品、SKU、购物车、拼团和优惠券入口。
- 已确认入口：首页、门店选择、取餐、我的、全部订单、优惠券。 底部导航；好友分享；配置正确页面地址的桌台小程序码。
- 接收参数与上下文：scene：桌台扫码信息，可选；share_goods_id：分享商品 ID，可选；share_pingtuan_open_id：分享拼团 ID，可选；inviter_id：由应用层处理。
- 登录/权限：普通模式调用静默登录；有效桌台 scene 使用桌台会话，不能等同普通用户会话。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 商品详情入口 → **商品详情** `/pages/ordering/goods-details/index`；方式：`go → navigateTo`；参数：id=商品 ID；条件：无额外前置条件。
- 公告条入口 → **公告详情** `/pages/home/notice/detail`；方式：`go → navigateTo`；参数：id=公告 ID；条件：已加载公告。
- 优惠券福袋入口 → **优惠券** `/pages/account/benefits/coupons/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 选择门店 → **门店选择** `/pages/ordering/shop/select`；方式：`go → navigateTo`；参数：type=index；条件：无额外前置条件。
- 门店详情入口 → **门店详情** `/pages/ordering/shop/detail`；方式：`go → navigateTo`；参数：id=当前门店 ID；条件：当前门店存在。
- 扫码购物车入口或扫码模式结算 → **桌台购物车** `/pages/ordering/cart/index`；方式：`go → navigateTo`；参数：无；条件：扫码模式。
- 扫码已点入口 → **桌台已点菜品** `/pages/ordering/cart/order`；方式：`go → navigateTo`；参数：无；条件：扫码模式。
- 普通模式结算 → **下单结算** `/pages/ordering/pay/index`；方式：`go → navigateTo`；参数：无；条件：普通模式，底部结算按钮在 opened 为真时显示；goPay 本身未额外检查购物车是否为空。
- 拼团购买 → **下单结算** `/pages/ordering/pay/index`；方式：`go → navigateTo`；参数：orderType=buyNow；pingtuanOpenId=当前拼团 ID；商品通过存储传递；条件：完成商品/规格与拼团流程。
- 退出扫码模式 → **点餐菜单** `/pages/ordering/index/index`；方式：`relaunch → reLaunch`；参数：无；清理扫码会话和门店状态；条件：用户选择退出扫码模式。
- 隐私权限提示后的重启 → **点餐菜单** `/pages/ordering/index/index`；方式：`relaunch → reLaunch`；参数：无；条件：定位错误为隐私权限未授权，提示完成。

动态/外部行为：轮播 linkUrl 与首页使用相同 openLink 规则；目标由后台配置。

返回行为：无自定义返回动作。

其他交互：SKU、购物车、拼团、优惠券弹层；扫码模式调整底部导航显隐。

分享/码入口：

- 好友分享 → 点餐菜单 `/pages/ordering/index/index`；携带 inviter_id；拼团分享时 share_goods_id、share_pingtuan_open_id。

逻辑依据：useIndexPage.ts（项目根目录：`src/pages/ordering/index/composables/useIndexPage.ts`）、useShopSection.ts（项目根目录：`src/pages/ordering/index/composables/useShopSection.ts`）、useCartBar.ts（项目根目录：`src/pages/ordering/index/composables/useCartBar.ts`）、usePingtuan.ts（项目根目录：`src/pages/ordering/index/composables/usePingtuan.ts`）。

#### 商品列表与搜索 · `Routes.goodsList`

- 文件：src/pages/ordering/goods/list.vue（项目根目录：`src/pages/ordering/goods/list.vue`）。
- 路由：`/pages/ordering/goods/list`。类型：普通页面。
- 职责：搜索、分类筛选、排序、分页和快速加购。
- 已确认入口：优惠券。
- 接收参数与上下文：name：可选搜索词，进行安全解码；categoryId：可选分类 ID。
- 登录/权限：浏览没有本页门禁；加购前检查登录，未登录时当前调用不继续加购。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 点击商品 → **商品详情** `/pages/ordering/goods-details/index`；方式：`go → navigateTo`；参数：id=商品 ID；条件：无额外前置条件。

返回行为：无自定义返回动作。

其他交互：列表/宫格切换；快速规格面板；普通加购成功留在本页。

逻辑依据：useGoodsListPage.ts（项目根目录：`src/pages/ordering/goods/composables/useGoodsListPage.ts`）。

#### 商品详情 · `Routes.goodsDetails`

- 文件：src/pages/ordering/goods-details/index.vue（项目根目录：`src/pages/ordering/goods-details/index.vue`）。
- 路由：`/pages/ordering/goods-details/index`。类型：普通页面。
- 职责：展示商品、规格、加料、时段、视频、砍价和分享海报。
- 已确认入口：点餐菜单、商品列表与搜索、优惠券。 点餐页、商品列表、优惠券使用；好友分享、海报小程序码。
- 接收参数与上下文：id：商品查询所需；scene：可选，解码为商品 ID 与邀请人，可覆盖 id；inviter_id：可选邀请人；kjJoinUid：可选砍价发起人。缺少有效商品 ID 时不读取详情。
- 登录/权限：显示时检查登录，未登录尝试 authorize；加购检查登录。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 砍价发起人的商品加购成功 → **下单结算** `/pages/ordering/pay/index`；方式：`go → navigateTo`；参数：kjId=当前砍价 ID；条件：满足砍价购买、规格、数量和登录检查。

返回行为：无自定义返回动作。

其他交互：规格面板、砍价操作、图片预览、海报生成与保存；普通加购不跳转。

分享/码入口：

- 好友分享 → 商品详情 `/pages/ordering/goods-details/index`；携带 id、inviter_id；砍价分享可附 kjJoinUid。
- 海报小程序码 → 商品详情 `/pages/ordering/goods-details/index`；携带 scene=商品 ID,邀请人 ID。

逻辑依据：useGoodsDetailPage.ts（项目根目录：`src/pages/ordering/goods-details/composables/useGoodsDetailPage.ts`）、useSkuSelector.ts（项目根目录：`src/pages/ordering/goods-details/composables/useSkuSelector.ts`）、usePoster.ts（项目根目录：`src/pages/ordering/goods-details/composables/usePoster.ts`）。

#### 门店选择 · `Routes.shopSelect`

- 文件：src/pages/ordering/shop/select.vue（项目根目录：`src/pages/ordering/shop/select.vue`）。
- 路由：`/pages/ordering/shop/select`。类型：普通页面。
- 职责：定位、搜索、选择当前门店，并提供入驻申请入口。
- 已确认入口：点餐菜单、下单结算、优惠买单。
- 接收参数与上下文：type：可选；index 表示点餐入口，pay 表示结算/买单入口，其他值走默认分支。
- 登录/权限：没有本页显式登录门禁；定位可能需要平台权限。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 选择门店 → **点餐菜单** `/pages/ordering/index/index`；方式：`go → switchTab`；参数：无；当前门店写入共享状态；条件：type 不是 pay。
- 申请入驻入口 → **入驻申请** `/pages-shop/access/onboarding/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。

返回行为：选择门店且 type=pay：back()；正常栈返回调用页面，具体上页由实际进入链路决定。

其他交互：门店选择更新公共门店状态；type=index 时设置点餐刷新标记。

逻辑依据：useShopSelectPage.ts（项目根目录：`src/pages/ordering/shop/composables/useShopSelectPage.ts`）。

#### 门店详情 · `Routes.shopDetail`

- 文件：src/pages/ordering/shop/detail.vue（项目根目录：`src/pages/ordering/shop/detail.vue`）。
- 路由：`/pages/ordering/shop/detail`。类型：普通页面。
- 职责：展示门店图片、电话、地址、营业时间与地图。
- 已确认入口：点餐菜单。
- 接收参数与上下文：id：门店查询必需；缺失时不读取详情。
- 登录/权限：没有本页显式登录门禁。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：详情接口失败：提示后 back()。

其他交互：拨打门店电话；调用系统地图位置导航，均不是应用内页面跳转。

逻辑依据：useShopDetailPage.ts（项目根目录：`src/pages/ordering/shop/composables/useShopDetailPage.ts`）。

#### 入驻申请 · `Routes.shopJoinApply`

- 文件：src/pages-shop/access/onboarding/index.vue（项目根目录：`src/pages-shop/access/onboarding/index.vue`）。
- 路由：`/pages-shop/access/onboarding/index`。类型：普通页面。
- 职责：提交联系人、电话、申请说明与门店附件。
- 已确认入口：门店选择。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：提交遇到需要重新登录的错误时重登后重试一次；没有独立登录页面跳转。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：提交成功约 1 秒后 back()；正常栈回到门店选择。

其他交互：最多 9 个附件；上传和提交状态、成功/失败提示。

逻辑依据：useJoinApplyPage.ts（项目根目录：`src/pages-shop/access/onboarding/composables/useJoinApplyPage.ts`）。

#### 桌台购物车 · `Routes.cart`

- 文件：src/pages/ordering/cart/index.vue（项目根目录：`src/pages/ordering/cart/index.vue`）。
- 路由：`/pages/ordering/cart/index`。类型：普通页面。
- 职责：展示扫码点餐购物车，调整数量、清空并提交桌台加菜。
- 已确认入口：点餐菜单。
- 接收参数与上下文：无本页读取的路由参数；依赖已有桌台、门店及购物车状态。
- 登录/权限：读取和提交依赖当前会话；此页没有额外的显式登录导航。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 提交桌台加菜成功 → **桌台已点菜品** `/pages/ordering/cart/order`；方式：`redirect → redirectTo`；参数：无；条件：桌台加菜接口成功后调用清空购物车；清空失败返回 false 时当前代码仍执行跳转。

返回行为：无自定义返回动作；成功提交后替换到已点菜品页面。

其他交互：数量更新、清空、下拉刷新。

逻辑依据：useCartPage.ts（项目根目录：`src/pages/ordering/cart/composables/useCartPage.ts`）。清空操作的返回值没有被提交后流程用于阻止跳转，本条记录现状，不表示清空一定成功。

#### 桌台已点菜品 · `Routes.cartOrder`

- 文件：src/pages/ordering/cart/order.vue（项目根目录：`src/pages/ordering/cart/order.vue`）。
- 路由：`/pages/ordering/cart/order`。类型：普通页面。
- 职责：展示当前桌台待支付订单和菜品状态，提供买单。
- 已确认入口：点餐菜单、桌台购物车。
- 接收参数与上下文：无本页读取的路由参数；从 list({status:0}) 第一条订单取得 ID 和商品。
- 登录/权限：查询依赖桌台会话；买单授权取得临时 payToken，不覆盖桌台会话。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：支付面板；支付成功仅关闭面板、显示成功状态并清除 payToken；取消也清除 payToken。

逻辑依据：useTableOrderPage.ts（项目根目录：`src/pages/account/orders/order/composables/useTableOrderPage.ts`）。

#### 下单结算 · `Routes.pay`

- 文件：src/pages/ordering/pay/index.vue（项目根目录：`src/pages/ordering/pay/index.vue`）。
- 路由：`/pages/ordering/pay/index`。类型：普通页面。
- 职责：处理收货/自提、门店、联系电话、用餐时间、优惠券/卡、试算、下单和支付。
- 已确认入口：点餐菜单、商品详情。
- 接收参数与上下文：orderType：可选，buyNow 从公共存储读取拼团商品，否则读取购物车；pingtuanOpenId：可选拼团 ID；kjId：可选砍价 ID。配送方式与门店通过共享状态传递。
- 登录/权限：显示时检查登录；用户资料和下单依赖会话；资料未完善时提供前往“我的”的按钮。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 选择收货地址 → **收货地址** `/pages/account/ad/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 选择门店 → **门店选择** `/pages/ordering/shop/select`；方式：`go → navigateTo`；参数：type=pay；条件：无额外前置条件。
- 完善头像昵称 → **我的** `/pages/account/index/index`；方式：`go → switchTab`；参数：无；条件：无额外前置条件。
- 创建订单后的后续处理 → **全部订单** `/pages/account/orders/all-orders/index`；方式：`redirect → redirectTo`；参数：无；条件：返回订单非待支付，或余额读取失败，或尝试余额支付结束。
- 在线支付成功回调 → **全部订单** `/pages/account/orders/all-orders/index`；方式：`redirect → redirectTo`；参数：无；条件：支付面板发出 ok。

返回行为：地址/门店选择完成后经返回栈恢复本页，并在 onShow 刷新。

其他交互：用餐时间、优惠券和卡选择面板；手机号授权；订阅消息；支付面板。

逻辑依据：usePayPage.ts（项目根目录：`src/pages/ordering/pay/composables/usePayPage.ts`）、useDelivery.ts（项目根目录：`src/pages/ordering/pay/composables/useDelivery.ts`）、useSubmitOrder.ts（项目根目录：`src/pages/ordering/pay/composables/useSubmitOrder.ts`）。

#### 优惠买单 · `Routes.youhuiPay`

- 文件：src/pages/ordering/youhui-pay/index.vue（项目根目录：`src/pages/ordering/youhui-pay/index.vue`）。
- 路由：`/pages/ordering/youhui-pay/index`。类型：普通页面。
- 职责：输入门店消费金额，计算优惠、余额抵扣并发起买单。
- 已确认入口：我的。
- 接收参数与上下文：无本页读取的路由参数；门店来自共享状态。
- 登录/权限：读取资产或提交遇到认证错误时重登重试；没有单独的登录路由。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 选择门店 → **门店选择** `/pages/ordering/shop/select`；方式：`go → navigateTo`；参数：type=pay；条件：无额外前置条件。
- 在线支付成功回调 → **我的钱包** `/pages/account/asset/index`；方式：`redirect → redirectTo`；参数：无；条件：支付面板发出 ok。

返回行为：无自定义返回动作。

其他交互：金额校验、余额支付确认、支付面板；直接余额支付后提示并留在本页，在线支付取消只关闭面板。

逻辑依据：useYouhuiPayPage.ts（项目根目录：`src/pages/ordering/youhui-pay/composables/useYouhuiPayPage.ts`）。

### 取号（2 个页面）

#### 排队取号 · `Routes.queue`

- 文件：src/pages/queue/index/index.vue（项目根目录：`src/pages/queue/index/index.vue`）。
- 路由：`/pages/queue/index/index`。类型：底部导航页。
- 职责：展示取号类型、当前号码和预计等待信息。
- 已确认入口：未发现其他页面的固定按钮直达入口。 底部导航。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：显示时检查会话，未登录尝试 authorize；取号时未登录尝试 login，并刷新，不自动继续本次取号。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：取号成功提示并更新我的排队记录；全部留在本页。

逻辑依据：useQueuePage.ts（项目根目录：`src/pages/queue/index/composables/useQueuePage.ts`）。

#### 在线订座 · `Routes.booking`

- 文件：src/pages/queue/booking/index.vue（项目根目录：`src/pages/queue/booking/index.vue`）。
- 路由：`/pages/queue/booking/index`。类型：普通页面。
- 职责：填写联系人、电话、到店时间、人数并提交预约。
- 已确认入口：我的。
- 接收参数与上下文：无本页读取的路由参数；预约配置由系统参数读取。
- 登录/权限：显示时未登录：提示后 back()；提交认证错误支持一次重登重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：未登录或提交成功后 back()；成功返回延迟约 1 秒。

其他交互：日期时间面板、人数选择、表单校验。

逻辑依据：useBookingPage.ts（项目根目录：`src/pages/queue/booking/composables/useBookingPage.ts`）。

### 取餐（3 个页面）

#### 取餐 · `Routes.orderDoing`

- 文件：src/pages/pickup/index/index.vue（项目根目录：`src/pages/pickup/index/index.vue`）。
- 路由：`/pages/pickup/index/index`。类型：底部导航页。
- 职责：展示状态 1、2 的进行中订单、取餐号、核销码与配送信息。
- 已确认入口：未发现其他页面的固定按钮直达入口。 底部导航。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：只在 checkHasLogined 返回真时读取订单；本页未实现未登录跳转。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 空订单状态的去点餐按钮 → **点餐菜单** `/pages/ordering/index/index`；方式：`go → switchTab`；参数：无；条件：无额外前置条件。

返回行为：无自定义返回动作。

其他交互：订单卡片左右切换、二维码展示；卡片当前是展示组件，没有详情点击入口。

逻辑依据：useOrderDoingPage.ts（项目根目录：`src/pages/pickup/index/composables/useOrderDoingPage.ts`）。

#### 订单详情 · `Routes.orderDetails`

- 文件：src/pages/pickup/order-details/index.vue（项目根目录：`src/pages/pickup/order-details/index.vue`）。
- 路由：`/pages/pickup/order-details/index`。类型：普通页面。
- 职责：展示订单、配送、取餐码，支持支付、确认收货和评价。
- 已确认入口：全部订单。 订单列表；外部支付回跳可能使用 payOrderNo，但本项目未找到该回跳 URL 的生成点。
- 接收参数与上下文：id：直接查询订单所需；payOrderNo：可选支付单号，可反查订单。没有有效订单 ID 时不读取详情。
- 登录/权限：订单请求使用 withLoginRetry；余额/在线支付依赖用户会话。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 按 payOrderNo 反查支付记录 → **我的钱包** `/pages/account/asset/index`；方式：`go → navigateTo`；参数：无；条件：第一条记录的 nextAction 不对应订单。
- 在线支付成功回调 → **全部订单** `/pages/account/orders/all-orders/index`；方式：`redirect → redirectTo`；参数：无；条件：支付面板发出 ok。

返回行为：无自定义返回动作。

其他交互：支付面板、收货确认、评价、拨号、复制订单号；余额支付后刷新本页。

逻辑依据：useOrderDetailPage.ts（项目根目录：`src/pages/pickup/order-details/composables/useOrderDetailPage.ts`）、useOrderDetailPay.ts（项目根目录：`src/pages/pickup/order-details/composables/useOrderDetailPay.ts`）。

#### 扫码核销结果 · `Routes.orderScanResult`

- 文件：src/pages/pickup/order-details/scan-result.vue（项目根目录：`src/pages/pickup/order-details/scan-result.vue`）。
- 路由：`/pages/pickup/order-details/scan-result`。类型：普通页面。
- 职责：按核销码查订单，展示核销内容并支持核销、评价。
- 已确认入口：我的。
- 接收参数与上下文：hxNumber：查询所需；来自扫码结果。缺失时仍进入查询流程，未见前端缺参拦截。
- 登录/权限：请求使用 withLoginRetry；核销入口在“我的”按配置的用户 ID 列表显示，后端权限需要独立校验。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：状态 1 或 2 时显示核销能力；核销、评价后刷新本页，没有固定跳转。

逻辑依据：useScanResultPage.ts（项目根目录：`src/pages/pickup/order-details/composables/useScanResultPage.ts`）。

### 我的（19 个页面）

#### 我的 · `Routes.my`

- 文件：src/pages/account/index/index.vue（项目根目录：`src/pages/account/index/index.vue`）。
- 路由：`/pages/account/index/index`。类型：底部导航页。
- 职责：展示用户信息、资产、服务菜单，提供资料修改、核销、客服和外部管理后台入口。
- 已确认入口：下单结算。 底部导航。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：没有本页显式登录门禁；详情、资产、资料修改依赖公共会话。核销入口由 canHX 控制显示。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 签到入口 → **每日签到** `/pages/account/benefits/sign/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 在线订座入口 → **在线订座** `/pages/queue/booking/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 优惠买单入口 → **优惠买单** `/pages/ordering/youhui-pay/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 会员信息或会员中心入口 → **会员中心** `/pages/account/benefits/member-center/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 全部订单入口 → **全部订单** `/pages/account/orders/all-orders/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 地址管理入口 → **收货地址** `/pages/account/ad/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 关于我们入口 → **关于与内容单页** `/pages/account/services/about/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 意见反馈入口 → **意见反馈** `/pages/account/index/feedback`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 余额入口 → **我的钱包** `/pages/account/asset/index`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 积分入口 → **积分明细** `/pages/account/benefits/score/logs`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 会员码入口 → **动态会员码** `/pages/account/index/user-code`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 优惠券资产入口 → **优惠券** `/pages/account/benefits/coupons/index`；方式：`go → navigateTo`；参数：tabIndex=1（目标当前未读取）；条件：无额外前置条件。
- 扫码识别成功 → **扫码核销结果** `/pages/pickup/order-details/scan-result`；方式：`go → navigateTo`；参数：hxNumber=扫码结果；条件：核销入口按 canHX 显示；扫码成功。
- 清除缓存 → **点餐菜单** `/pages/ordering/index/index`；方式：`relaunch → reLaunch`；参数：无；同时清理会话和门店状态；条件：用户触发清缓存。

动态/外部行为：管理后台：navigateToMiniProgram 打开外部管理小程序的 pages/autoLogin，携带当前会话 token 参数（本文不记录值）；不是本项目页面。客服：调用平台客服能力；当前模板在 customerServiceType=QW 时显示客服，管理后台按钮未用 isAdmin 条件限制显示。

返回行为：无自定义返回动作。

其他交互：昵称弹窗、头像选择、复制用户 ID、扫码、客服；清缓存同时清理会话与门店状态。

逻辑依据：useMyPage.ts（项目根目录：`src/pages/account/index/composables/useMyPage.ts`）。

#### 意见反馈 · `Routes.feedback`

- 文件：src/pages/account/index/feedback.vue（项目根目录：`src/pages/account/index/feedback.vue`）。
- 路由：`/pages/account/index/feedback`。类型：普通页面。
- 职责：提交姓名、电话、内容及附件。
- 已确认入口：我的。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：提交认证错误支持一次重登重试；没有独立登录页面跳转。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：提交成功约 1 秒后 back()；正常栈回到“我的”。

其他交互：最多 6 个附件；提交中状态、成功/失败提示。

逻辑依据：useFeedbackPage.ts（项目根目录：`src/pages/account/index/composables/useFeedbackPage.ts`）。

#### 动态会员码 · `Routes.userCode`

- 文件：src/pages/account/index/user-code.vue（项目根目录：`src/pages/account/index/user-code.vue`）。
- 路由：`/pages/account/index/user-code`。类型：普通页面。
- 职责：展示动态二维码、条形码、余额与积分。
- 已确认入口：我的。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：动态会员码和资产接口依赖会话；认证错误支持一次重登重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：可见期间每 60 秒刷新动态码；隐藏/卸载停止计时器；支持下拉刷新。

逻辑依据：useUserCodePage.ts（项目根目录：`src/pages/account/index/composables/useUserCodePage.ts`）。

#### 收货地址 · `Routes.ad`

- 文件：src/pages/account/ad/index.vue（项目根目录：`src/pages/account/ad/index.vue`）。
- 路由：`/pages/account/ad/index`。类型：普通页面。
- 职责：地址列表、默认选择、新增编辑删除及行政区/位置选择。
- 已确认入口：下单结算、我的。
- 接收参数与上下文：id：可选，直接开启对应地址编辑；不传则展示列表。
- 登录/权限：显示时未登录提示后 back()；接口认证错误可重登重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：选择地址尝试设为默认后在 finally 中 back()，接口失败也返回；未登录也 back()。

其他交互：新增和编辑在本页表单内完成；保存后关闭编辑并刷新列表；系统位置选择不是新增页面。

逻辑依据：useAddressPage.ts（项目根目录：`src/pages/account/ad/composables/useAddressPage.ts`）。

#### 我的钱包 · `Routes.asset`

- 文件：src/pages/account/asset/index.vue（项目根目录：`src/pages/account/asset/index.vue`）。
- 路由：`/pages/account/asset/index`。类型：普通页面。
- 职责：展示余额、充值套餐、自定义充值及资金流水入口。
- 已确认入口：优惠买单、订单详情、我的。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：资产请求依赖会话，认证错误支持一次重登重试；没有独立登录导航。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 充值记录入口 → **充值记录** `/pages/account/asset/recharge-log`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 资金明细入口 → **资金明细** `/pages/account/asset/cash-log`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。

返回行为：无自定义返回动作。

其他交互：充值金额弹窗与支付面板；充值成功关闭面板并刷新余额，取消只关闭面板。

逻辑依据：useAssetPage.ts（项目根目录：`src/pages/account/asset/composables/useAssetPage.ts`）。

#### 充值记录 · `Routes.rechargeLog`

- 文件：src/pages/account/asset/recharge-log.vue（项目根目录：`src/pages/account/asset/recharge-log.vue`）。
- 路由：`/pages/account/asset/recharge-log`。类型：普通页面。
- 职责：展示成功充值记录。
- 已确认入口：我的钱包。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：请求依赖会话，认证错误支持一次重登重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：当前一次读取最多 500 条成功记录；无业务跳转按钮。

逻辑依据：useRechargeLogPage.ts（项目根目录：`src/pages/account/asset/composables/useRechargeLogPage.ts`）。

#### 资金明细 · `Routes.cashLog`

- 文件：src/pages/account/asset/cash-log.vue（项目根目录：`src/pages/account/asset/cash-log.vue`）。
- 路由：`/pages/account/asset/cash-log`。类型：普通页面。
- 职责：分页展示资金变动记录。
- 已确认入口：我的钱包。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：请求依赖会话，认证错误尝试重登后重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：触底加载；无业务跳转按钮。

逻辑依据：useCashLogPage.ts（项目根目录：`src/pages/account/asset/composables/useCashLogPage.ts`）。

#### 全部订单 · `Routes.allOrders`

- 文件：src/pages/account/orders/all-orders/index.vue（项目根目录：`src/pages/account/orders/all-orders/index.vue`）。
- 路由：`/pages/account/orders/all-orders/index`。类型：普通页面。
- 职责：展示订单与商品，支持详情、取消、删除、售后和支付。
- 已确认入口：下单结算、订单详情、我的。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：显示时未登录提示后 back()；请求使用 withLoginRetry。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 空订单状态的去点餐按钮 → **点餐菜单** `/pages/ordering/index/index`；方式：`go → switchTab`；参数：无；条件：无额外前置条件。
- 点击订单卡片 → **订单详情** `/pages/pickup/order-details/index`；方式：`go → navigateTo`；参数：id=订单 ID；条件：无额外前置条件。
- 售后按钮 → **订单售后** `/pages/account/orders/refund-apply/index`；方式：`go → navigateTo`；参数：id=订单 ID；条件：订单卡片满足售后按钮显隐规则。
- 在线支付成功回调 → **全部订单** `/pages/account/orders/all-orders/index`；方式：`redirect → redirectTo`；参数：无；条件：支付面板发出 ok。

返回行为：未登录时 back()；在线支付成功会替换到本路由。

其他交互：取消/删除确认、拨号、支付确认与支付面板；余额支付后刷新本页。

逻辑依据：useAllOrdersPage.ts（项目根目录：`src/pages/account/orders/all-orders/composables/useAllOrdersPage.ts`）、useOrderPay.ts（项目根目录：`src/pages/account/orders/all-orders/composables/useOrderPay.ts`）。

#### 订单售后 · `Routes.refundApply`

- 文件：src/pages/account/orders/refund-apply/index.vue（项目根目录：`src/pages/account/orders/refund-apply/index.vue`）。
- 路由：`/pages/account/orders/refund-apply/index`。类型：普通页面。
- 职责：展示售后记录，提交退款申请，处理取消申请和寄回物流。
- 已确认入口：全部订单。
- 接收参数与上下文：id：订单查询所需；缺失时仍尝试查询，未见独立缺参拦截；查询失败提示后返回。
- 登录/权限：订单读取使用 withLoginRetry；具体售后提交权限由接口控制。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：订单查询失败或申请提交成功后 back()；正常栈回到订单列表。

其他交互：商品选择、申请表单、附件选择/预览、售后详情弹窗、物流填写弹窗、客服；取消申请和填写物流后刷新本页。

逻辑依据：useRefundApplyPage.ts（项目根目录：`src/pages/account/orders/refund-apply/composables/useRefundApplyPage.ts`）、useRefundForm.ts（项目根目录：`src/pages/account/orders/refund-apply/composables/useRefundForm.ts`）、useRefundDetail.ts（项目根目录：`src/pages/account/orders/refund-apply/composables/useRefundDetail.ts`）。

#### 会员中心 · `Routes.memberCenter`

- 文件：src/pages/account/benefits/member-center/index.vue（项目根目录：`src/pages/account/benefits/member-center/index.vue`）。
- 路由：`/pages/account/benefits/member-center/index`。类型：普通页面。
- 职责：展示当前会员等级、累计消费与等级体系。
- 已确认入口：首页、我的。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：等级列表和用户信息分别读取；个人等级/累计消费依赖会话，本页没有显式登录跳转。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：信息展示；未实现独立的升级购买或其他页面跳转按钮。

逻辑依据：useMemberCenterPage.ts（项目根目录：`src/pages/account/benefits/member-center/composables/useMemberCenterPage.ts`）。

#### 优惠券 · `Routes.coupons`

- 文件：src/pages/account/benefits/coupons/index.vue（项目根目录：`src/pages/account/benefits/coupons/index.vue`）。
- 路由：`/pages/account/benefits/coupons/index`。类型：普通页面。
- 职责：可领取、已领取、失效券展示，口令/券号兑换和使用入口。
- 已确认入口：首页、点餐菜单、我的。 首页、点餐福袋、“我的”；好友/朋友圈分享。
- 接收参数与上下文：本页 onLoad 不读取查询参数；“我的”传入 tabIndex=1，但当前未消费该参数；inviter_id 由应用层处理。
- 登录/权限：刷新时检查会话；领取、兑换遇到认证错误时重登重试；没有独立登录导航。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 优惠券去使用 → **点餐菜单** `/pages/ordering/index/index`；方式：`go → switchTab`；参数：无；条件：券使用范围解析为菜单。
- 优惠券去使用 → **商品列表与搜索** `/pages/ordering/goods/list`；方式：`go → navigateTo`；参数：categoryId=券限定分类 ID；条件：券使用范围解析为分类。
- 优惠券去使用 → **商品详情** `/pages/ordering/goods-details/index`；方式：`go → navigateTo`；参数：id=券限定商品 ID；条件：券使用范围解析为商品。

返回行为：无自定义返回动作。

其他交互：切换券分类、口令弹窗、兑换、下拉刷新。

分享/码入口：

- 好友/朋友圈分享 → 优惠券 `/pages/account/benefits/coupons/index`；携带 inviter_id。

逻辑依据：useCouponsPage.ts（项目根目录：`src/pages/account/benefits/coupons/composables/useCouponsPage.ts`）。

#### 礼品卡 · `Routes.card`

- 文件：src/pages/account/benefits/card/index.vue（项目根目录：`src/pages/account/benefits/card/index.vue`）。
- 路由：`/pages/account/benefits/card/index`。类型：普通页面。
- 职责：展示可购卡、我的卡，支持购买、兑换、赠送、取消赠送和明细。
- 已确认入口：首页。 首页；好友/朋友圈分享。
- 接收参数与上下文：本页不读取路由参数；inviter_id 由应用层处理；兑换/赠送返回通过 cardMyRefresh 存储标记刷新。
- 登录/权限：我的卡和购买依赖会话；认证错误支持重登重试，没有单独登录页。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 兑换入口 → **礼品卡兑换** `/pages/account/benefits/card/exchange`；方式：`go → navigateTo`；参数：无；条件：无额外前置条件。
- 赠送所选卡 → **赠送礼品卡** `/pages/account/benefits/card/send`；方式：`go → navigateTo`；参数：无；卡写入 StorageKeys.sendCard；条件：选定用户卡。
- 消费明细入口 → **礼品卡消费明细** `/pages/account/benefits/card/logs`；方式：`go → navigateTo`；参数：cardId=用户卡 ID；条件：无额外前置条件。

动态/外部行为：轮播 linkUrl 直接调用 go(url)，与首页的 openLink 处理不同；未见 HTTP(S) 外链分支，不能据此认为外链可正常打开。

返回行为：无自定义返回动作。

其他交互：购买打开支付面板；成功切到“我的卡”并刷新；取消赠送刷新本页，不跳转。

分享/码入口：

- 好友/朋友圈分享 → 礼品卡 `/pages/account/benefits/card/index`；携带 inviter_id。

逻辑依据：useCardPage.ts（项目根目录：`src/pages/account/benefits/card/composables/useCardPage.ts`）。

#### 礼品卡兑换 · `Routes.cardExchange`

- 文件：src/pages/account/benefits/card/exchange.vue（项目根目录：`src/pages/account/benefits/card/exchange.vue`）。
- 路由：`/pages/account/benefits/card/exchange`。类型：普通页面。
- 职责：输入兑换码并同意礼品卡协议后兑换。
- 已确认入口：礼品卡。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：兑换认证错误支持一次重登重试。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 点击礼品卡协议 → **关于与内容单页** `/pages/account/services/about/index`；方式：`go → navigateTo`；参数：key=lipinkaxieyi；条件：无额外前置条件。

返回行为：兑换成功后 back()；正常栈回到礼品卡首页并切换/刷新我的卡。

其他交互：同意协议开关、兑换成功提示；设置 cardMyRefresh 标记。

逻辑依据：useCardExchangePage.ts（项目根目录：`src/pages/account/benefits/card/composables/useCardExchangePage.ts`）。

#### 礼品卡消费明细 · `Routes.cardLogs`

- 文件：src/pages/account/benefits/card/logs.vue（项目根目录：`src/pages/account/benefits/card/logs.vue`）。
- 路由：`/pages/account/benefits/card/logs`。类型：普通页面。
- 职责：分页展示一张用户卡的消费记录。
- 已确认入口：礼品卡。
- 接收参数与上下文：cardId：业务查询所需；缺失默认空字符串仍发起读取，未见独立缺参拦截。
- 登录/权限：接口使用当前会话；本页未见独立登录门禁或重登处理。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：下拉刷新、触底加载；无业务跳转按钮。

逻辑依据：useCardLogsPage.ts（项目根目录：`src/pages/account/benefits/card/composables/useCardLogsPage.ts`）。

#### 赠送礼品卡 · `Routes.cardSend`

- 文件：src/pages/account/benefits/card/send.vue（项目根目录：`src/pages/account/benefits/card/send.vue`）。
- 路由：`/pages/account/benefits/card/send`。类型：普通页面。
- 职责：读取选中的用户卡，开启赠送并生成好友领取链接。
- 已确认入口：礼品卡。
- 接收参数与上下文：无本页读取的路由参数；必需上下文来自 StorageKeys.sendCard，直接打开页面不能保证有待赠送卡。
- 登录/权限：赠送接口依赖会话，认证错误支持一次重登重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回动作；分享是接收者入口，不是发送者当前页面跳转。

其他交互：修改赠送留言；隐藏右上角分享菜单，通过页面按钮分享；设置返回刷新标记。

分享/码入口：

- 好友赠卡分享 → 领取礼品卡 `/pages/account/benefits/card/receive`；携带 id、shareToken、inviter_id。

逻辑依据：useCardSendPage.ts（项目根目录：`src/pages/account/benefits/card/composables/useCardSendPage.ts`）。

#### 领取礼品卡 · `Routes.cardReceive`

- 文件：src/pages/account/benefits/card/receive.vue（项目根目录：`src/pages/account/benefits/card/receive.vue`）。
- 路由：`/pages/account/benefits/card/receive`。类型：普通页面。
- 职责：预览好友赠送的卡并领取。
- 已确认入口：未发现其他页面的固定按钮直达入口。 仅确认好友分享入口；未发现当前用户通过普通按钮直接进入此页。 接收分享来源：赠送礼品卡。
- 接收参数与上下文：id：用户卡 ID；shareToken：赠送凭据，均为领取流程所需；inviter_id 由应用层处理。缺失参数仍调用预览接口。
- 登录/权限：领取接口依赖会话，认证错误支持一次重登重试。
- 跳转状态：已确认有固定业务页面跳转。

页面跳转：

- 提示后确认 → **首页** `/pages/home/index/index`；方式：`relaunch → reLaunch`；参数：无；条件：领取成功，或预览/领取失败且重登重试仍未恢复。

返回行为：提示确认后 reLaunch 首页，清空页面栈。

其他交互：进入时 calculate=true 预览；点击领取 calculate=false；成功或不可领取时显示确认提示。

逻辑依据：useCardReceivePage.ts（项目根目录：`src/pages/account/benefits/card/composables/useCardReceivePage.ts`）。

#### 积分明细 · `Routes.scoreLogs`

- 文件：src/pages/account/benefits/score/logs.vue（项目根目录：`src/pages/account/benefits/score/logs.vue`）。
- 路由：`/pages/account/benefits/score/logs`。类型：普通页面。
- 职责：分页展示积分变动记录。
- 已确认入口：我的。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：请求依赖会话，认证错误尝试重登后重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：触底加载；无业务跳转按钮。

逻辑依据：useScoreLogsPage.ts（项目根目录：`src/pages/account/benefits/score/composables/useScoreLogsPage.ts`）。

#### 每日签到 · `Routes.sign`

- 文件：src/pages/account/benefits/sign/index.vue（项目根目录：`src/pages/account/benefits/sign/index.vue`）。
- 路由：`/pages/account/benefits/sign/index`。类型：普通页面。
- 职责：展示签到日历并提交今日签到。
- 已确认入口：我的。
- 接收参数与上下文：无本页读取的路由参数。
- 登录/权限：显示时未登录尝试 login；签到认证错误支持一次重登重试。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：日历和签到提示；成功刷新签到记录，留在本页。

逻辑依据：useSignPage.ts（项目根目录：`src/pages/account/benefits/sign/composables/useSignPage.ts`）。

#### 关于与内容单页 · `Routes.about`

- 文件：src/pages/account/services/about/index.vue（项目根目录：`src/pages/account/services/about/index.vue`）。
- 路由：`/pages/account/services/about/index`。类型：普通页面。
- 职责：按 CMS key 展示关于我们、透明食材或礼品卡协议。
- 已确认入口：首页、我的、礼品卡兑换。
- 接收参数与上下文：key：可选，默认 about；已确认入口传入 toumingshicai、lipinkaxieyi。
- 登录/权限：没有本页显式登录门禁。
- 跳转状态：已确认无固定业务页面跳转。

返回行为：无自定义返回或固定业务页面跳转。

其他交互：富文本展示；未绑定页面级富文本链接跳转，后台内容中的外链待确认。

逻辑依据：useAboutPage.ts（项目根目录：`src/pages/account/services/about/composables/useAboutPage.ts`）。

## 5. 关键跨页流程

### 5.1 普通点餐与结算

首页选择自取/外卖 → 点餐菜单 → 选择商品/SKU并加入购物车 → 点餐底部结算 → 下单结算。结算可进入地址或门店选择；正常返回栈下返回结算并刷新。资料未完善时切换“我的”，需要用户自行回到结算流程，不是完成资料后自动返回。

正式创建订单后，非待支付、读取余额失败或尝试余额支付结束等分支替换到全部订单；需要在线支付时先打开 PaymentPanel，ok 后替换到全部订单，cancel 只关闭面板。取消支付不等于取消已创建订单。

### 5.2 扫码桌台点餐

桌台小程序码 → 点餐菜单（有效 scene 建立桌台会话）→ 桌台购物车 → 加菜成功并尝试清空购物车 → redirectTo 桌台已点菜品。菜单也可直接进入已点菜品。买单取得临时用户 payToken → 支付面板 → 成功状态留在已点菜品页；成功或取消均清除临时令牌。退出扫码模式则清理相应状态并 reLaunch 点餐菜单。

### 5.3 拼团与砍价

点餐拼团流程 → 将商品写入存储 → 结算携带 orderType=buyNow、pingtuanOpenId。商品详情中砍价发起人的购买流程 → 加购成功 → 结算携带 kjId。两者不要混为同一种商品来源。

### 5.4 取号与预约

底部取号 → 选择取号类型 → 接口提交 → 更新本页号码，无独立“取号成功”路由。“我的” → 在线订座 → 表单提交成功 → back()；预约页面没有独立预约记录页面跳转。

### 5.5 取餐、订单和售后

底部取餐 → 展示进行中订单与取餐码。当前取餐卡片没有详情按钮；订单详情的已确认入口是“我的” → 全部订单 → 订单卡片。全部订单 → 售后 → 提交成功返回；售后记录详情与物流填写都在弹窗内完成。

订单列表或详情在线支付成功 → redirectTo 全部订单；余额支付后刷新原页面。

### 5.6 核销

“我的”中具备 canHX 显示条件 → 扫码 → 扫码核销结果（hxNumber）→ 核销/评价 → 刷新同页。扫码入口显示条件不能替代后端权限校验。

### 5.7 礼品卡与钱包

首页 → 礼品卡 → 兑换 → 协议 CMS / 兑换成功返回并刷新我的卡；礼品卡 → 赠送（卡写入存储）→ 好友分享 → 接收者领取页（id、shareToken）→ 成功或失败提示后 reLaunch 首页。赠卡分享不是发送者本人跳转领取页。

“我的” → 钱包 → 充值支付面板 → 成功刷新钱包；钱包 → 充值记录/资金明细。优惠买单在线支付成功替换到钱包，直接余额支付成功留在买单页。

## 6. 动态目标与核实事项

- 首页、点餐和礼品卡的轮播目标来自后台，静态代码无法给出全部目标；上线前需核实实际 linkUrl 指向已注册的新路径。礼品卡轮播与其他轮播的外链处理不同。
- `payOrderNo` 的详情页接收逻辑已确认，但本项目未发现生成该详情回跳地址的代码；实际支付平台回跳方式及参数需联调确认。
- 优惠券入口传递 tabIndex=1，但当前目标页未读取；文档不把“直接展示已领取”记为已实现。
- 登录、平台客服、跨小程序导航、扫码、地图、分享和生产支付行为未进行真机核实；这里只记录实际调用链。
- 没有看到固定入口，不等于页面不存在或不可通过外部链接打开；固定按钮入口、动态配置和分享入口分别记录。
- 当前路径对应实际目录，公共导航没有旧页面路径自动映射。外部后台配置、已发布分享链接或小程序码是否指向当前路径需要另外核实。
- 本文只记录参数名称及用途，不收录真实 token、shareToken、手机号、用户 ID 或生产响应样本。

## 7. 维护规则

1. 新增、删除、搬迁页面，或修改参数、入口、跳转方式、前置条件时，同步更新对应页面条目及其进入/离开关系。
2. 检查页面模板、子组件事件、主 composable 和拆分的辅助 composables；不能只检索 `.vue` 中的导航调用。
3. 用源码核实固定目标；用后台资料核实动态链接；无法确认的行为保持“待确认”，不要补写推测路径。
4. 路由常量以公共 navigation 为调用入口，tabBar 以应用配置为依据，页面注册由扫描配置生成；不手改生成的 pages.json 或声明文件来配合文档。
5. `README.md` 解释业务职责，`docs/db.md` 解释后端数据，本文解释页面和导航；重复信息用链接引用。
6. 核实完成后更新顶部日期；涉及外部平台的验证注明平台、环境和证据，不以静态检查代替联调结论。


## 角色分包入口和页面

我的页面导航至商家登录 /pages-shop/access/auth/login、入驻申请 /pages-shop/access/onboarding/index、骑手登录 /pages-rider/access/auth/login。入驻是真实留言收集；角色后台功能暂未开放，不代表可执行后台操作。

- 商家登录：/pages-shop/access/auth/login
- 商家工作台：/pages-shop/workspace/index/index
- 商品管理：/pages-shop/business/goods/index
- 商品编辑：/pages-shop/business/goods/edit
- 商家订单：/pages-shop/operations/order/index
- 订单详情：/pages-shop/operations/order/detail
- 桌台管理：/pages-shop/operations/table/index
- 配送与派单：/pages-shop/operations/delivery/index
- 营销活动：/pages-shop/business/marketing/index
- 经营统计：/pages-shop/business/statistics/index
- 门店设置：/pages-shop/management/shop/index
- 商家账号：/pages-shop/management/account/index
- 骑手登录：/pages-rider/access/auth/login
- 骑手工作台：/pages-rider/workspace/index/index
- 配送任务：/pages-rider/delivery/task/index
- 配送任务详情：/pages-rider/delivery/task/detail
- 骑手个人中心：/pages-rider/account/index/index
- 骑手资料：/pages-rider/account/profile/index
- 骑手设置：/pages-rider/account/settings/index

分包页面使用普通导航，返回我的使用 switchTab。旧入驻页面只重定向。各领域 README.md 描述状态和依赖。
