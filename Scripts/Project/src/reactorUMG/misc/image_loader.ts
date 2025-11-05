import { toDelegate } from 'puerts';
import * as UE from 'ue';

export class ImageLoader {
    static loadTextureFromImagePath(imagePath: string) : UE.Texture2D | undefined {
        // todo@Caleb196x: 定制化导入函数，传入参数为相对于Content/JavaScript的绝对路径名，提高导入性能
        const texture = UE.KismetRenderingLibrary.ImportFileAsTexture2D(null, imagePath);
        if (texture) {
            return texture;
        } else {
            console.warn(`Failed to load texture from image path: ${imagePath}`);
        }
        return undefined;
    }

    static loadBrushImageObject(object: UE.Object, imagePath: string, dirName?: string, syncLoad?: boolean, onLoad?: (object: UE.Object)=>void, onError?: ()=>void)
    {
        if (!syncLoad) {
            syncLoad = false;
        }

        const OnLoadDelegate = toDelegate(object, onLoad);
        const OnErrorDelegate = toDelegate(object, onError);

        UE.UMGManager.LoadBrushImageObject(
            imagePath, OnLoadDelegate, OnErrorDelegate, object ? object : null, syncLoad, dirName ? dirName : ""
        );
    }
}
