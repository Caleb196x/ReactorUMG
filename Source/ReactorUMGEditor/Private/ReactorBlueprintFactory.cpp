#include "ReactorBlueprintFactory.h"
#include "Kismet2/KismetEditorUtilities.h"
#include "ReactorUMGWidgetBlueprint.h"
#include "ReactorUIWidget.h"
#include "ReactorUtils.h"


void TemplateScriptCreator::GenerateTemplateLaunchScripts()
{
	GenerateLaunchTsxFile(TsScriptHomeFullDir);
	GenerateIndexTsFile(TsScriptHomeFullDir);
	GenerateAppFile(TsScriptHomeFullDir);
}

void TemplateScriptCreator::GenerateLaunchTsxFile(const FString& ScriptHome)
{
	const FString LaunchTsxFilePath = FPaths::Combine(ScriptHome, TEXT("launch.tsx"));
	GeneratedTemplateOutput = {"", ""};
	GeneratedTemplateOutput << "/** !!!Warning: Auto-generated code, please do not make any changes */ \n";
	GeneratedTemplateOutput << "import * as UE from \"ue\";\n";
	GeneratedTemplateOutput << "import { $Nullable, argv } from \"puerts\";\n";
	GeneratedTemplateOutput << "import {ReactorUMG, Root} from \"reactorUMG\";\n";
	GeneratedTemplateOutput << "import * as React from \"react\";\n";

	const FString ImportWidget = FString::Printf(TEXT("import { %s } from \"./%s\"\n"), *WidgetName, *WidgetName);
	GeneratedTemplateOutput << ImportWidget << "\n";
	GeneratedTemplateOutput << "let bridgeCaller = (argv.getByName(\"ReactorUIWidget_BridgeCaller\") as UE.JsBridgeCaller);\n";
	GeneratedTemplateOutput << "let container = (argv.getByName(\"WidgetTree\") as UE.WidgetTree);\n";
	GeneratedTemplateOutput << "let customArgs = (argv.getByName(\"CustomArgs\") as UE.CustomJSArg);\n";
	GeneratedTemplateOutput << "function Launch(container: $Nullable<UE.WidgetTree>) : Root {\n";
	GeneratedTemplateOutput << "    return ReactorUMG.render(\n";
	GeneratedTemplateOutput << "       " << "container, \n";
	const FString ComponentName = FString::Printf(TEXT("<%s/> \n"), *WidgetName);
	GeneratedTemplateOutput << "       " << ComponentName;
	GeneratedTemplateOutput << "    );\n";
	GeneratedTemplateOutput << "}\n\n";
	GeneratedTemplateOutput << "if (customArgs.bIsUsingBridgeCaller && bridgeCaller && bridgeCaller.MainCaller) { \n";
	GeneratedTemplateOutput << "	if (bridgeCaller.MainCaller.IsBound()) {\n";
	GeneratedTemplateOutput << "		bridgeCaller.MainCaller.Unbind();\n";
	GeneratedTemplateOutput << "	}\n";
	GeneratedTemplateOutput << "    bridgeCaller.MainCaller.Bind(Launch);\n";
	GeneratedTemplateOutput << "} else { \n";
	GeneratedTemplateOutput << "	Launch(container);\n";
	GeneratedTemplateOutput << "}\n";
	GeneratedTemplateOutput << "argv.remove(\"WidgetTree\", container);\n";
	GeneratedTemplateOutput << "argv.remove(\"CustomArgs\", customArgs);\n";
	GeneratedTemplateOutput.Indent(4);
	
	GeneratedTemplateOutput.Prefix = TEXT(".tsx");
	FFileHelper::SaveStringToFile(GeneratedTemplateOutput.Buffer, *LaunchTsxFilePath, FFileHelper::EEncodingOptions::ForceUTF8);
}

void TemplateScriptCreator::GenerateAppFile(const FString& ScriptHome)
{
	const FString AppFilePath = FPaths::Combine(ScriptHome, WidgetName + TEXT(".tsx"));
	GeneratedTemplateOutput = {"", ""};
	GeneratedTemplateOutput << "import * as UE from \"ue\";\n";
	GeneratedTemplateOutput << "import * as React from \"react\";\n";

	const FString ClassDeclare = FString::Printf(TEXT("export class %s extends React.Component {\n"), *WidgetName);
	GeneratedTemplateOutput << ClassDeclare;
	GeneratedTemplateOutput << "    render() {\n";
	GeneratedTemplateOutput << "        /* Write your code here */\n";
	GeneratedTemplateOutput << "        return <div>Hello ReactorUMG!</div>\n";
	GeneratedTemplateOutput << "    }\n";
	GeneratedTemplateOutput << "}\n";

	GeneratedTemplateOutput.Prefix = TEXT(".tsx");
	FFileHelper::SaveStringToFile(GeneratedTemplateOutput.Buffer, *AppFilePath, FFileHelper::EEncodingOptions::ForceUTF8);
}

void TemplateScriptCreator::GenerateIndexTsFile(const FString& ScriptHome)
{
	const FString IndexFilePath = FPaths::Combine(ScriptHome, TEXT("index.ts"));
	GeneratedTemplateOutput = {"", ""};
	GeneratedTemplateOutput << "/** Note: Add your components to export */ \n";

	const FString Export = FString::Printf(TEXT("export * from \"./%s\"; \n"), *WidgetName);
	GeneratedTemplateOutput << Export;

	GeneratedTemplateOutput.Prefix = TEXT(".ts");
	FFileHelper::SaveStringToFile(GeneratedTemplateOutput.Buffer, *IndexFilePath, FFileHelper::EEncodingOptions::ForceUTF8);
}

UReactorBlueprintFactory::UReactorBlueprintFactory(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	bCreateNew = true;
	SupportedClass = UReactorUMGWidgetBlueprint::StaticClass();
	ParentClass = UReactorUIWidget::StaticClass();
}

UObject* UReactorBlueprintFactory::FactoryCreateNew(UClass* Class, UObject* Parent, FName Name, EObjectFlags Flags, UObject* Context, FFeedbackContext* Warn)
{
	// TODO@Caleb196x: 检查用于是否安装yarn, tsc, npm等必须依赖环境，否则禁止创建ReactorUMG蓝图类，并给出安装提示
	
	if ((ParentClass == NULL) || !FKismetEditorUtilities::CanCreateBlueprintOfClass(ParentClass) || !ParentClass->IsChildOf(UReactorUIWidget::StaticClass()))
	{
		FFormatNamedArguments Args;
		Args.Add(TEXT("ClassName"), (ParentClass != NULL) ? FText::FromString(
			ParentClass->GetName()) : NSLOCTEXT("ReactorUIWidget", "Null", "(null)"));
		FMessageDialog::Open(EAppMsgType::Ok, FText::Format(NSLOCTEXT("ReactorUIWidget", "CannotCreateReactorUMGBlueprint",
			"Cannot create a ReactorUIWidget based on the class '{ClassName}'."), Args));
		return nullptr;
	}

	const FString WidgetName = Name.ToString();
	const FString WidgetBPPathName = Parent->GetPathName();

	const FString TsScriptHomeFullDir = FPaths::Combine(FReactorUtils::GetGamePlayTSHomeDir(), WidgetBPPathName.Mid(5));
	FReactorUtils::CreateDirectoryRecursive(TsScriptHomeFullDir);
	TemplateScriptCreator Generator(TsScriptHomeFullDir, WidgetName);
	Generator.GenerateTemplateLaunchScripts();
	
	return CastChecked<UReactorUMGWidgetBlueprint>(FKismetEditorUtilities::CreateBlueprint(ParentClass, Parent, Name, BPTYPE_Normal,
		UReactorUMGWidgetBlueprint::StaticClass(), UBlueprintGeneratedClass::StaticClass(),
		"ReactorBlueprintFactory"));
}
