#pragma once
#include "Kismet2/CompilerResultsLog.h"
#include "WidgetBlueprintCompiler.h"

class FReactorUMGCompilerLog
{
public:
	FReactorUMGCompilerLog(FCompilerResultsLog& InMessageLog) : MessageLog(InMessageLog) {}
	
	TSharedRef<FTokenizedMessage> Error(const FText& Message) const
	{
		TSharedRef<FTokenizedMessage> Line = FTokenizedMessage::Create(EMessageSeverity::Error);
		Line->AddToken(FTextToken::Create(Message));
		InternalLogMessage(Line);
		return Line;
	}

	TSharedRef<FTokenizedMessage> Warning(const FText& Message) const
	{
		TSharedRef<FTokenizedMessage> Line = FTokenizedMessage::Create(EMessageSeverity::Warning);
		Line->AddToken(FTextToken::Create(Message));
		InternalLogMessage(Line);
		return Line;
	}

	TSharedRef<FTokenizedMessage> Note(const FText& Message) const
	{
		TSharedRef<FTokenizedMessage> Line = FTokenizedMessage::Create(EMessageSeverity::Info);
		Line->AddToken(FTextToken::Create(Message));
		InternalLogMessage(Line);
		return Line;
	}
	
protected:
	void InternalLogMessage(TSharedRef<FTokenizedMessage>& InMessage) const
	{
		MessageLog.AddTokenizedMessage(InMessage);
	}

private:
	FCompilerResultsLog& MessageLog;
};

class FReactorUMGBlueprintCompilerContext : public FWidgetBlueprintCompilerContext
{
protected:

	typedef FWidgetBlueprintCompilerContext Super;

public:
	FReactorUMGBlueprintCompilerContext(class UWidgetBlueprint* SourceBlueprint,
		FCompilerResultsLog& InMessageLog, const FKismetCompilerOptions& InCompilerOptions);
	virtual ~FReactorUMGBlueprintCompilerContext();

	// FKismetCompilerContext interface
	virtual void SpawnNewClass(const FString& NewClassName) override;
	virtual void EnsureProperGeneratedClass(UClass*& TargetClass) override;
	virtual void CopyTermDefaultsToDefaultObject(UObject* DefaultObject) override;
	virtual void FinishCompilingClass(UClass* Class) override;
	// End of FKismetCompilerContext interface
};

