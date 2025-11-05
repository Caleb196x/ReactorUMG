// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "EditorUtilityWidgetBlueprint.h"
#include "UObject/Object.h"
#include "ReactorUMGCommonBP.h"
#include "ReactorUMGUtilityWidgetBlueprint.generated.h"

/**
 * 
 */
UCLASS(meta = (ShowWorldContextPin), config = Editor)
class REACTORUMGEDITOR_API UReactorUMGUtilityWidgetBlueprint : public UEditorUtilityWidgetBlueprint
{
	GENERATED_UCLASS_BODY()
public:
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
	
	void RegisterBlueprintDeleteHandle() const;
	UPROPERTY()
	TObjectPtr<UReactorUMGCommonBP> ReactorUMGCommonBP;
};
