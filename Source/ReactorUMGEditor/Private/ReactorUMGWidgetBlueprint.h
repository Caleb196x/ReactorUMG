#pragma once
#include "CoreMinimal.h"
#include "WidgetBlueprint.h"
#include "ReactorUMGCommonBP.h"
#include "ReactorUMGWidgetBlueprint.generated.h"

UCLASS(BlueprintType, meta = (ShowWorldContextPin), config = Editor)
class REACTORUMGEDITOR_API UReactorUMGWidgetBlueprint : public UWidgetBlueprint
{
	GENERATED_UCLASS_BODY()
public:
	/**
	* 1. 在AssetEditorSubsystem的OnAssetOpenedInEditor事件中触发监听模式
	* 2. 在在AssetEditorSubsystem的OnAssetClosedInEditor事件中结束监听模式
	 */
	void SetupMonitorForTsScripts();
	void SetupTsScripts(const FReactorUMGCompilerLog& CompilerResultsLogger, bool bForceCompile = false, bool bForceReload = false);

	UFUNCTION(BlueprintCallable)
	void ForceDeleteAssets(const TArray<UObject*>& InAssetsToDelete);

	FORCEINLINE FString GetMainScriptPath() const { if (ReactorUMGCommonBP) return ReactorUMGCommonBP->MainScriptPath;  return TEXT("");  }
	FORCEINLINE FString GetTsProjectDir() const { if (ReactorUMGCommonBP) return ReactorUMGCommonBP->TsProjectDir;  return TEXT("");  }
	FORCEINLINE FString GetTsScriptHomeFullDir() const { if (ReactorUMGCommonBP) return ReactorUMGCommonBP->TsScriptHomeFullDir;  return TEXT("");  }
	FORCEINLINE FString GetTsScriptHomeRelativeDir() const { if (ReactorUMGCommonBP) return ReactorUMGCommonBP->TsScriptHomeRelativeDir;  return TEXT("");  }
	FORCEINLINE FString GetWidgetName() const { if (ReactorUMGCommonBP) return ReactorUMGCommonBP->WidgetName;  return TEXT("");  }

protected:
	virtual bool Rename(const TCHAR* NewName = nullptr, UObject* NewOuter = nullptr, ERenameFlags Flags = REN_None) override;
	virtual UClass* GetBlueprintClass() const override;
	virtual bool SupportedByDefaultBlueprintFactory() const override;
	
	void RegisterBlueprintDeleteHandle();
	UPROPERTY()
	TObjectPtr<UReactorUMGCommonBP> ReactorUMGCommonBP;
};
