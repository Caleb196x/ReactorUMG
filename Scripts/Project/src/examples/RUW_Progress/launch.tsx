/** !!!Warning: Auto-generated code, please do not make any changes */ 
import * as UE from "ue";
import { $Nullable, argv } from "puerts";
import {ReactorUMG, Root} from "reactorUMG";
import * as React from "react";
import { RUW_Progress } from "./RUW_Progress"

let bridgeCaller = (argv.getByName("ReactorUIWidget_BridgeCaller") as UE.JsBridgeCaller);
let container = (argv.getByName("WidgetTree") as UE.WidgetTree);
let customArgs = (argv.getByName("CustomArgs") as UE.CustomJSArg);
function Launch(container: $Nullable<UE.WidgetTree>) : Root {
    return ReactorUMG.render(
       container, 
       <RUW_Progress/> 
    );
}

if (customArgs.bIsUsingBridgeCaller && bridgeCaller && bridgeCaller.MainCaller) { 
	if (bridgeCaller.MainCaller.IsBound()) {
		bridgeCaller.MainCaller.Unbind();
	}
    bridgeCaller.MainCaller.Bind(Launch);
} else { 
	Launch(container);
}
argv.remove("WidgetTree", container);
argv.remove("CustomArgs", customArgs);
