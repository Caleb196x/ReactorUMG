import * as UE from "ue";
import mixin from "src/PROJECT_NAME/mixin";
// 资产路径
const AssetPath = "BLUEPRINT_PATH";


// 创建一个继承ts类（或者其他类）的接口（用来类型提示）
export interface TS_NAME extends MIXIN_BLUEPRINT_TYPE {
}


// 创建一个继承ts的本体类    implements   实现类型提示
@mixin(AssetPath)
export class TS_NAME implements TS_NAME {
    static StaticClass: () => UE.Class;
}