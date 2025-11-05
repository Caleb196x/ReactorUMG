#pragma once
#include "JsEnv.h"
#include "JSLogger.h"

class FReactorUMGJSLogger : public PUERTS_NAMESPACE::ILogger
{
public:
	explicit FReactorUMGJSLogger(const FString& CategoryName = TEXT("ReactorUMG")) : MessageLogCategoryName(CategoryName) {}
	
	virtual ~FReactorUMGJSLogger()
	{
	}
	void Log(const FString& Message) const override;
	void Info(const FString& Message) const override;
	void Warn(const FString& Message) const override;
	void Error(const FString& Message) const override;

private:
	FString MessageLogCategoryName;
};

class FJsEnvRuntime
{
public:
	REACTORUMG_API static FJsEnvRuntime& GetInstance()
	{
		static FJsEnvRuntime Instance;
		return Instance;
	}

	~FJsEnvRuntime();

	REACTORUMG_API TSharedPtr<PUERTS_NAMESPACE::FJsEnv> GetFreeJsEnv();
		
	REACTORUMG_API bool StartJavaScript(const TSharedPtr<PUERTS_NAMESPACE::FJsEnv>& JsEnv, const FString& Script, const TArray<TPair<FString, UObject*>>& Arguments) const;

	REACTORUMG_API bool CheckScriptLegal(const FString& Script) const;

	REACTORUMG_API void ReleaseJsEnv(TSharedPtr<PUERTS_NAMESPACE::FJsEnv> JsEnv);

	REACTORUMG_API void RebuildRuntimePool();

	/**
	 * reload all javascript files under ScriptHomeDir
	 * @param ScriptHomeDir Relative path to the plugin content directory
	 */
	REACTORUMG_API void RestartJsScripts(const FString& JSContentDir, const FString& ScriptHomeDir, const FString& MainJsScript, const TArray<TPair<FString, UObject*>>& Arguments);

private:
	FJsEnvRuntime(int32 EnvPoolSize = 1);
	TMap<TSharedPtr<PUERTS_NAMESPACE::FJsEnv>, int32> JsRuntimeEnvPool;
	std::shared_ptr<FReactorUMGJSLogger> ReactorUmgLogger;
	int32 EnvPoolSize;
};
