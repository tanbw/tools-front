// src/types.ts
export interface User {
    id: number;
    username: string;
    email: string | null; // 后端返回了 null
    authorities: string[]; // 后端还返回了 authorities 字段
    promptPic: number | null;
    promptWav: number | null;
    draftId: number | null;
    balanceMs: number;
    balanceToken: number;
    balanceMin: number;
    balanceTokenM: number;
    // 如果后端还有其他字段，也可以在这里添加
}
export interface ModalComponent {
    open: () => void;
    // close?: () => void; // 如果有 close 方法也可以加上
}

export class TaskLog {
    id: number = 0;
    taskId: number | null = null;
    userId: number | null = null;
    createTime: Date | null = null;
    content: string | null = null;
    type: string | null = null;
    constructor(partial?: Partial<TaskLog>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
export class TaskLogItem {
    id: number | null = null;
    refId: number | null = null;
    module: string | null = null;
    content: string | null = null;
    type: string | null = null;
    createTime: Date | null = null;
    constructor(partial?: Partial<TaskLogItem>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
export class CopyItem {
    id: number | null = null;
    title: string = '';
    refStyle: string = `第一是做专业一定要纯，大家认不认同。有自己核心的东西。这个叫专业的纯净性。比如说一个来访者过来，比如我是精神分析学派，我给来访者做精神分析，就只做精神分析，别的就不用去做。
不要这个星期来我们做认知，下个星期来我做催眠，再来再怎么样，这个叫不恒定，对来访者来说，也是不稳定。这个意思大家能懂吗？
就相当于你手受伤了，今天给你用这个，明天给你用那个，后天再给你用另外一个。这个反而不利于成长。`;
    content: string = '';
    contentCount: number = 300;
    oriContent: string = '';
    userId: number | null = null;
    createTime: Date | null = null;
    state: string | null = null;
    promptPic: number | null = null;
    promptWav: number | null = null;
    draftId: number | null = null;
    // 构造函数可以接收一个可选的 partial 对象来覆盖默认值
    constructor(partial?: Partial<CopyItem>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}

export class DownloadCopyItem {
    id: number | null = null;
    title: string = '';
    content: string = '';
    createTime: Date | null = null;
    state: string | null = null;

    // 构造函数可以接收一个可选的 partial 对象来覆盖默认值
    constructor(partial?: Partial<DownloadCopyItem>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
export class VideoItem {
    content: string | null = null;
    createTime: Date | null = null;
    duration: number | null = null; // 对应 Java Long
    id: number | null = null;       // 对应 Java Integer + @Id
    promptPic: number | null = null;
    promptWav: number | null = null;
    serverId: number | null = null; // 对应 Java Integer
    soxCmd: string | null = null;
    state: string | null = null;
    taskId: string | null = null;
    title: string | null = null;
    userId: number | null = null;   // 对应 Java Integer
    draftId: number | null = null;
    constructor(init?: Partial<VideoItem>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}
export class ResourceItem {
    createTime: Date | null = null;
    id: number | null = null;
    type: 'image' | 'audio' | null = null;
    path: string | null = null;
    content: string | null = null;
    prompt: string | null = ` 一位男子在整个视频中保持上身绝对静止和稳定。他的头部完全不动，正面朝向镜头，面部表情中性且专注。双手自然交叉，仅偶尔使用非常细微的手势。
  在画面右上角，有且仅有一只固定的眼睛，从始至终以规律节奏眨眼。整个视频过程中，画面元素必须保持稳定，绝对不允许出现第二只眼睛或任何额外的动画元素。`;
    nprompt: string | null = `亮色调，曝光过度，模糊细节，最差质量，低质量，丑陋，变形，多余手指。
  人物错误：视线偏离镜头，转头，身体摇晃，夸张手势，头部移动，挑眉。
  特定动画错误：多只眼睛，额外的眨眼动画，星云立体变形，星云三维翻滚，星云扭曲，星云改变形状，星云停止旋转，星云改变旋转速度，星云改变旋转方向，随机出现新元素，元素数量或位置发生变化，画面布局不一致。`;
    draftTemplate: number | null = 0;
    userId: number | null = null;
    user: User | null = null;
    constructor(init?: Partial<ResourceItem>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}
// 定义类型
export class ListParams {
    page: number = 0; // Spring Data 从 0 开始
    size: number = 10;
    sort?: string | null = null; // 例如 'title,asc' 或 'content,desc'

    constructor(partial?: Partial<ListParams>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
export class DraftTemplate {
    id: number | null = null; 
    userId: number | null = null;
    musicId: number | null = null;
    name: string | null = null;
    createTime: Date | null = null;
    currentUserDraftId: number | null = null; 
    constructor(partial?: Partial<DraftTemplate>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
// 定义 Spring Data Sort 对象的类型
interface PageSortItem {
    direction: 'ASC' | 'DESC';
    property: string;
    ignoreCase: boolean;
    nullHandling: string; // 可能是 'NATIVE', 'NULLS_FIRST', 'NULLS_LAST'
    descending: boolean;
    ascending: boolean;
}

export interface PageSort {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
    sort: PageSortItem[]; // 包含排序字段数组
}

export interface Pageable {
    sort: PageSort;
    offset: number;
    pageNumber: number; // 从 0 开始
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
}

export interface Page<T> {
    content: T[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    sort: PageSort; // 与 pageable.sort 相同
    numberOfElements: number;
    size: number;
    number: number; // 页码 (从 0 开始)
    empty: boolean;
}
