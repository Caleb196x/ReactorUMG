#include "ReactorUtilityWidget.h"

#include "ReactorUIWidget.h"
#include "JsBridgeCaller.h"
#include "JsEnvRuntime.h"
#include "LogReactorUMG.h"
#include "ReactorUMGBlueprintGeneratedClass.h"
#include "ReactorUtils.h"
#include "CustomJSArg.h"
#include "Blueprint/WidgetTree.h"

UReactorUtilityWidget::UReactorUtilityWidget(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer), CustomJSArg(nullptr), LaunchScriptPath(TEXT("")),
		JsEnv(nullptr), bWidgetTreeInitialized(false)
{
}

bool UReactorUtilityWidget::Initialize()
{
	const bool SuperRes = Super::Initialize();
	SetupNewWidgetTree();
	return SuperRes;
}

void UReactorUtilityWidget::BeginDestroy()
{
	Super::BeginDestroy();
}

void UReactorUtilityWidget::SetupNewWidgetTree()
{
	if (!bWidgetTreeInitialized && !HasAnyFlags(RF_ClassDefaultObject))
	{
		/*if (WidgetTree != nullptr)
		{
			UWidgetTree* OldWidgetTree = WidgetTree;
			WidgetTree = NewObject<UWidgetTree>(this, TEXT("ReactorUMGEditorUtility_WidgetTree"), RF_Transient);
			OldWidgetTree->MarkAsGarbage();
			OldWidgetTree = nullptr;
		} else
		{
			WidgetTree = NewObject<UWidgetTree>(this, TEXT("ReactorUMGEditorUtility_WidgetTree"), RF_Transient);
		}*/
		
		UReactorUMGBlueprintGeneratedClass* ReactorBPGC = Cast<UReactorUMGBlueprintGeneratedClass>(GetClass());
		if (ReactorBPGC)
		{
			TsProjectDir = ReactorBPGC->TsProjectDir;
			TsScriptHomeRelativeDir = ReactorBPGC->TsScriptHomeRelativeDir;
			LaunchScriptPath = ReactorBPGC->MainScriptPath;
			if (!LaunchScriptPath.IsEmpty())
			{
				
				if (this->WidgetTree && WidgetTree->RootWidget)
				{
					auto flags = this->WidgetTree->RootWidget->GetDesignerFlags();
					if (!EnumHasAnyFlags(flags, EWidgetDesignFlags::Designing))
					{
						this->WidgetTree->RootWidget->RemoveFromParent();
						this->WidgetTree->RootWidget->MarkAsGarbage();
						this->WidgetTree->RootWidget = nullptr;
						RunScriptToInitWidgetTree();
					}
				}
			}
		}
		
		bWidgetTreeInitialized = true;
	}
}

const FText UReactorUtilityWidget::GetPaletteCategory()
{
	return NSLOCTEXT("ReactorUMG", "UIWidget", "ReactorUMGEditorUtility");
}

void UReactorUtilityWidget::RunScriptToInitWidgetTree()
{
	if (UJsBridgeCaller::IsExistBridgeCaller(LaunchScriptPath))
	{
		const bool DelegateRunResult = UJsBridgeCaller::ExecuteMainCaller(LaunchScriptPath, this->WidgetTree);
		if (!DelegateRunResult)
		{
			UJsBridgeCaller::RemoveBridgeCaller(LaunchScriptPath);
			ReleaseJsEnv();
			UE_LOG(LogReactorUMG, Warning, TEXT("Not bind any bridge caller for %s"), *LaunchScriptPath);
		}
	} else if (!LaunchScriptPath.IsEmpty())
	{
		TArray<TPair<FString, UObject*>> Arguments;
		UJsBridgeCaller* Caller = UJsBridgeCaller::AddNewBridgeCaller(LaunchScriptPath);
		Arguments.Add(TPair<FString, UObject*>(TEXT("ReactorUIWidget_BridgeCaller"), Caller));
		Arguments.Add(TPair<FString, UObject*>(TEXT("WidgetTree"), this->WidgetTree));

		if (!CustomJSArg)
		{
			CustomJSArg = NewObject<UCustomJSArg>(this, FName("ReactorUIWidget_CustomArgs"), RF_Transient);
		}
		CustomJSArg->bIsUsingBridgeCaller = true;
		Arguments.Add(TPair<FString, UObject*>(TEXT("CustomArgs"), CustomJSArg));
	
		JsEnv = FJsEnvRuntime::GetInstance().GetFreeJsEnv();
		if (JsEnv)
		{
			const FString JSScriptContentDir = FReactorUtils::GetTSCBuildOutDirFromTSConfig(TsProjectDir);
			FJsEnvRuntime::GetInstance().RestartJsScripts(JSScriptContentDir, TsScriptHomeRelativeDir, LaunchScriptPath, Arguments);
		}
		else
		{
			UJsBridgeCaller::RemoveBridgeCaller(LaunchScriptPath);
			UE_LOG(LogReactorUMG, Error, TEXT("Can not obtain any valid javascript runtime environment"))
			return;
		}
		
		ReleaseJsEnv();

		const bool DelegateRunResult = UJsBridgeCaller::ExecuteMainCaller(LaunchScriptPath, this->WidgetTree);
		if (!DelegateRunResult)
		{
			UJsBridgeCaller::RemoveBridgeCaller(LaunchScriptPath);
			UE_LOG(LogReactorUMG, Warning, TEXT("Not bind any bridge caller for %s"), *LaunchScriptPath);
		}
	}
}

void UReactorUtilityWidget::ReleaseJsEnv()
{
	if (JsEnv)
	{
		UE_LOG(LogReactorUMG, Display, TEXT("Release javascript env in order to excuting other script"))
		FJsEnvRuntime::GetInstance().ReleaseJsEnv(JsEnv);
		JsEnv = nullptr;
	}
}