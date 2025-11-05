// Fill out your copyright notice in the Description page of Project Settings.
#pragma once

#include "CoreMinimal.h"
#include "CustomJSArg.h"
#include "UObject/Object.h"
#include "Components/PanelSlot.h"
#include "ReactorBlueprintCompilerContext.h"
#include "ReactorUMGCommonBP.generated.h"

namespace puerts
{
	class FJsEnv;
}

DECLARE_MULTICAST_DELEGATE_ThreeParams(
	FDirectoryMonitorCallback, const TArray<FString>&, const TArray<FString>&, const TArray<FString>&);

DECLARE_DYNAMIC_DELEGATE_OneParam(FCompileReportDelegate, const FString&, Message);


class FDirectoryMonitor
{
public:
	FDirectoryMonitor() : bIsWatching(false) {}
	~FDirectoryMonitor() {}

	FDirectoryMonitorCallback& OnDirectoryChanged() { return OnChanged; }

	void Watch(const FString& InDirectory);
	void UnWatch();
	
private:
	FDelegateHandle DelegateHandle;

	FDirectoryMonitorCallback OnChanged;

	FString CurrentMonitorDirectory;
	
	bool bIsWatching;
};

UCLASS(BlueprintType)
class UCompileErrorReport : public UObject
{
	GENERATED_BODY()
public:
	UPROPERTY(BlueprintType)
	FCompileReportDelegate CompileReportDelegate;
};

/**
 * ReactorUMG和ReactorUtilityUMG共有的功能类
 */
UCLASS()
class REACTORUMGEDITOR_API UReactorUMGCommonBP : public UObject
{
	GENERATED_BODY()
	
public:
	UFUNCTION(BlueprintCallable, Category="ReactorUMGEditor|WidgetBlueprint")
	UPanelSlot* AddChild(UWidget* Content);
	
	UFUNCTION(BlueprintCallable, Category="ReactorUMGEditor|WidgetBlueprint")
	bool RemoveChild(UWidget* Content);
	
	UFUNCTION(BlueprintCallable, Category="ReactorUMGEditor|WidgetBlueprint")
	void ReleaseJsEnv();

	UFUNCTION(Blueprintable, Category="ReactorUMGEditor|WidgetBlueprint")
	void ReportToMessageLog(const FString& Message);
	
	FORCEINLINE FString GetWidgetName() { return WidgetName; }

	void SetupTsScripts(const FReactorUMGCompilerLog& CompilerResultsLogger, bool bForceCompile = false, bool bForceReload = false);
	void ReloadJsScripts();
	void ExecuteJsScripts();
	void CompileTsScript();
	void RenameScriptDir(const TCHAR* NewName, UObject* NewOuter);
	void StartTsScriptsMonitor(TFunction<void()>&& MarkBPDirtyCallback);
	void BuildAllNeedPaths(const FString& InWidgetName, const FString& WidgetPath, const FString& HomePrefix = TEXT(""));
	void DeleteRelativeDirectories(const FAssetData& AssetData, const FName& BPName, const FString& BPPath);
	
	UFUNCTION(BlueprintCallable)
	FString GetTsProjectDir() const { return TsProjectDir; }
	
	UFUNCTION(BlueprintCallable)
	FString GetTsScriptHomeFullDir() const { return TsScriptHomeFullDir; }

	UFUNCTION(BlueprintCallable)
	FString GetTsScriptHomeRelativeDir() const { return TsScriptHomeRelativeDir; }

	UPROPERTY()
	TObjectPtr<class UWidgetTree> WidgetTree;
	
	FString TsProjectDir;
	FString TsScriptHomeFullDir;
	FString TsScriptHomeRelativeDir;
	FString WidgetName;
	// The path of the main javascript file where the entry function is used to execute during the runtime,
	// which is the relative path of the Content/JavaScript path.
	FString MainScriptPath;
	FString LaunchJsScriptFullPath;
	FString JSScriptContentDir;
		
	void StopTsScriptsMonitor()
	{
		TsProjectMonitor.UnWatch();
		TsProjectMonitor.OnDirectoryChanged().Remove(TsMonitorDelegateHandle);
	}
	
	UPROPERTY(BlueprintType, VisibleAnywhere, Category="ReactorUMGEditor|WidgetBlueprint")
	UCompileErrorReport* CompileErrorReporter;
	
protected:
	
	bool CheckLaunchJsScriptExist();
	FString GetLaunchJsScriptPath(bool bForceFullPath = true);
	/**
	 * Repeat the script function via the bridge caller,
	 * You need to bind the function to the bridge caller in the script.
	 * @param ScriptPath 
	 */
	void ExecuteScriptFunctionViaBridgeCaller(const FString& BindName, const FString& ScriptPath);
	
	FDirectoryMonitor TsProjectMonitor;
private:
	UPROPERTY()
	TObjectPtr<UCustomJSArg> CustomJSArg;
	UPROPERTY()
	TObjectPtr<UPanelSlot> RootSlot;
	
	TSharedPtr<puerts::FJsEnv> JsEnv;
	FDelegateHandle TsMonitorDelegateHandle;
	FString TSCompileErrorMessageBuffer;
	bool bTsScriptsChanged;
};
