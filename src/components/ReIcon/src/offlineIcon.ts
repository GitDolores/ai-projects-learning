// 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
import { getSvgInfo } from '@pureadmin/utils'
import { addIcon, addCollection } from '@iconify/vue/dist/offline'
// 完整图标集数据（@iconify/json 已包含全部图标，用于离线渲染）
import epIcons from '@iconify/json/json/ep.json'
import riIcons from '@iconify/json/json/ri.json'
import faSolidIcons from '@iconify/json/json/fa-solid.json'

// https://icon-sets.iconify.design/ep/?keyword=ep
import EpMenu from '~icons/ep/menu?raw'
import EpEdit from '~icons/ep/edit?raw'
import EpGuide from '~icons/ep/guide?raw'
import EpSetUp from '~icons/ep/set-up?raw'
import EpMonitor from '~icons/ep/monitor?raw'
import EpLollipop from '~icons/ep/lollipop?raw'
import EpHistogram from '~icons/ep/histogram?raw'
import EpHomeFilled from '~icons/ep/home-filled?raw'
import EpUser from '~icons/ep/user?raw'
import EpUserFilled from '~icons/ep/user-filled?raw'
import EpOfficeBuilding from '~icons/ep/office-building?raw'
import EpKey from '~icons/ep/key?raw'
import EpNotebook from '~icons/ep/notebook?raw'
import EpMedal from '~icons/ep/medal?raw'
import EpLock from '~icons/ep/lock?raw'
import EpConnection from '~icons/ep/connection?raw'
import EpSetting from '~icons/ep/setting?raw'
import EpFolder from '~icons/ep/folder?raw'
import EpTickets from '~icons/ep/tickets?raw'
import EpCoordinate from '~icons/ep/coordinate?raw'
import EpLink from '~icons/ep/link?raw'
import EpDataAnalysis from '~icons/ep/data-analysis?raw'
import EpDataBoard from '~icons/ep/data-board?raw'
import EpDocument from '~icons/ep/document?raw'
import EpEditPen from '~icons/ep/edit-pen?raw'
import EpDish from '~icons/ep/dish?raw'
import EpCpu from '~icons/ep/cpu?raw'
import EpDishDot from '~icons/ep/dish-dot?raw'
import EpDocumentChecked from '~icons/ep/document-checked?raw'
import EpMagicStick from '~icons/ep/magic-stick?raw'
import EpTools from '~icons/ep/tools?raw'
import EpCopyDocument from '~icons/ep/copy-document?raw'
import EpShip from '~icons/ep/ship?raw'
import EpFolderOpened from '~icons/ep/folder-opened?raw'
import EpUpload from '~icons/ep/upload?raw'
import EpDownload from '~icons/ep/download?raw'
import EpView from '~icons/ep/view?raw'
import EpFolderAdd from '~icons/ep/folder-add?raw'
import EpPicture from '~icons/ep/picture?raw'
import EpClock from '~icons/ep/clock?raw'
import EpAlarmClock from '~icons/ep/alarm-clock?raw'
import EpList from '~icons/ep/list?raw'

// https://icon-sets.iconify.design/ri/?keyword=ri
import RiMindMap from '~icons/ri/mind-map?raw'
import RiAdminFill from '~icons/ri/admin-fill?raw'
import RiTableLine from '~icons/ri/table-line?raw'
import RiLinksFill from '~icons/ri/links-fill?raw'
import RiAdminLine from '~icons/ri/admin-line?raw'
import RiListCheck from '~icons/ri/list-check?raw'
import RiSearchLine from '~icons/ri/search-line?raw'
import RiWindowLine from '~icons/ri/window-line?raw'
import RiUbuntuFill from '~icons/ri/ubuntu-fill?raw'
import RiHistoryFill from '~icons/ri/history-fill?raw'
import RiEditBoxLine from '~icons/ri/edit-box-line?raw'
import RiCodeBoxLine from '~icons/ri/code-box-line?raw'
import RiArtboardLine from '~icons/ri/artboard-line?raw'
import RiMarkdownLine from '~icons/ri/markdown-line?raw'
import RiFileInfoLine from '~icons/ri/file-info-line?raw'
import RiBankCardLine from '~icons/ri/bank-card-line?raw'
import RiFilePpt2Line from '~icons/ri/file-ppt-2-line?raw'
import RiGitBranchLine from '~icons/ri/git-branch-line?raw'
import RiSettings3Line from '~icons/ri/settings-3-line?raw'
import RiUserVoiceLine from '~icons/ri/user-voice-line?raw'
import RiBookmark2Line from '~icons/ri/bookmark-2-line?raw'
import RiFileSearchLine from '~icons/ri/file-search-line?raw'
import RiChatSearchLine from '~icons/ri/chat-search-line?raw'
import RiInformationLine from '~icons/ri/information-line?raw'
import RiTerminalWindowLine from '~icons/ri/terminal-window-line?raw'
import RiCheckboxCircleLine from '~icons/ri/checkbox-circle-line?raw'
import RiBarChartHorizontalLine from '~icons/ri/bar-chart-horizontal-line?raw'
import RiChatSmile3Line from '~icons/ri/chat-smile-3-line?raw'
import RiUser3Line from '~icons/ri/user-3-line?raw'
import RiSendPlaneFill from '~icons/ri/send-plane-fill?raw'
import RiBookReadLine from '~icons/ri/book-read-line?raw'
import RiDatabase2Line from '~icons/ri/database-2-line?raw'
import RiQuestionAnswerLine from '~icons/ri/question-answer-line?raw'
import RiBookOpenLine from '~icons/ri/book-open-line?raw'
import RiRobotLine from '~icons/ri/robot-line?raw'
import RiAlertLine from '~icons/ri/alert-line?raw'
import RiSubtractLine from '~icons/ri/subtract-line?raw'
import RiArticleLine from '~icons/ri/article-line?raw'
import RiLightbulbLine from '~icons/ri/lightbulb-line?raw'
import RiFileCopyLine from '~icons/ri/file-copy-line?raw'
import RiCapsuleLine from '~icons/ri/capsule-line?raw'
import RiChatCheckLine from '~icons/ri/chat-check-line?raw'
import RiFlag2Line from '~icons/ri/flag-2-line?raw'

const icons = [
    // Element Plus Icon: https://github.com/element-plus/element-plus-icons
    ['ep/menu', EpMenu],
    ['ep/edit', EpEdit],
    ['ep/guide', EpGuide],
    ['ep/set-up', EpSetUp],
    ['ep/monitor', EpMonitor],
    ['ep/lollipop', EpLollipop],
    ['ep/histogram', EpHistogram],
    ['ep/home-filled', EpHomeFilled],
    ['ep/user', EpUser],
    ['ep/user-filled', EpUserFilled],
    ['ep/office-building', EpOfficeBuilding],
    ['ep/key', EpKey],
    ['ep/notebook', EpNotebook],
    ['ep/medal', EpMedal],
    ['ep/lock', EpLock],
    ['ep/connection', EpConnection],
    ['ep/setting', EpSetting],
    ['ep/folder', EpFolder],
    ['ep/tickets', EpTickets],
    ['ep/coordinate', EpCoordinate],
    ['ep/link', EpLink],
    ['ep/data-analysis', EpDataAnalysis],
    ['ep/data-board', EpDataBoard],
    ['ep/document', EpDocument],
    ['ep/edit-pen', EpEditPen],
    ['ep/dish', EpDish],
    ['ep/cpu', EpCpu],
    ['ep/dish-dot', EpDishDot],
    ['ep/document-checked', EpDocumentChecked],
    ['ep/magic-stick', EpMagicStick],
    ['ep/tools', EpTools],
    ['ep/copy-document', EpCopyDocument],
    ['ep/ship', EpShip],
    ['ep/folder-opened', EpFolderOpened],
    ['ep/upload', EpUpload],
    ['ep/download', EpDownload],
    ['ep/view', EpView],
    ['ep/folder-add', EpFolderAdd],
    ['ep/picture', EpPicture],
    ['ep/clock', EpClock],
    ['ep/alarm-clock', EpAlarmClock],
    ['ep/list', EpList],
    // Remix Icon: https://github.com/Remix-Design/RemixIcon
    ['ri/mind-map', RiMindMap],
    ['ri/admin-fill', RiAdminFill],
    ['ri/table-line', RiTableLine],
    ['ri/links-fill', RiLinksFill],
    ['ri/admin-line', RiAdminLine],
    ['ri/list-check', RiListCheck],
    ['ri/search-line', RiSearchLine],
    ['ri/window-line', RiWindowLine],
    ['ri/ubuntu-fill', RiUbuntuFill],
    ['ri/history-fill', RiHistoryFill],
    ['ri/edit-box-line', RiEditBoxLine],
    ['ri/code-box-line', RiCodeBoxLine],
    ['ri/artboard-line', RiArtboardLine],
    ['ri/markdown-line', RiMarkdownLine],
    ['ri/file-info-line', RiFileInfoLine],
    ['ri/bank-card-line', RiBankCardLine],
    ['ri/file-ppt-2-line', RiFilePpt2Line],
    ['ri/git-branch-line', RiGitBranchLine],
    ['ri/settings-3-line', RiSettings3Line],
    ['ri/user-voice-line', RiUserVoiceLine],
    ['ri/bookmark-2-line', RiBookmark2Line],
    ['ri/file-search-line', RiFileSearchLine],
    ['ri/chat-search-line', RiChatSearchLine],
    ['ri/information-line', RiInformationLine],
    ['ri/terminal-window-line', RiTerminalWindowLine],
    ['ri/checkbox-circle-line', RiCheckboxCircleLine],
    ['ri/bar-chart-horizontal-line', RiBarChartHorizontalLine],
    ['ri/chat-smile-3-line', RiChatSmile3Line],
    ['ri/user-3-line', RiUser3Line],
    ['ri/send-plane-fill', RiSendPlaneFill],
    ['ri/book-read-line', RiBookReadLine],
    ['ri/database-2-line', RiDatabase2Line],
    ['ri/question-answer-line', RiQuestionAnswerLine],
    ['ri/book-open-line', RiBookOpenLine],
    ['ri/robot-line', RiRobotLine],
    ['ri/alert-line', RiAlertLine],
    ['ri/subtract-line', RiSubtractLine],
    ['ri/article-line', RiArticleLine],
    ['ri/question-answer-line', RiQuestionAnswerLine],
    ['ri/lightbulb-line', RiLightbulbLine],
    ['ri/file-copy-line', RiFileCopyLine],
    ['ri/capsule-line', RiCapsuleLine],
    ['ri/chat-check-line', RiChatCheckLine],
    ['ri/flag-2-line', RiFlag2Line],
]

// 本地菜单图标，后端在路由的 icon 中返回对应的图标字符串并且前端在此处使用 addIcon 添加即可渲染菜单图标
icons.forEach(([name, icon]) => {
    addIcon(name as string, getSvgInfo(icon as string))
})

// 批量注册完整图标集，保证菜单管理选择器中的图标全部可离线渲染，
// 无需访问 Iconify 在线 API（https://api.iconify.design）
// 同时注册冒号前缀（选择器 ep:xxx）与斜杠前缀（数据库存储 ep/xxx）两种格式
;[epIcons, riIcons, faSolidIcons].forEach((collection) => {
    const data = collection as any
    addCollection(data)
    addCollection(data, data.prefix + '/')
})
