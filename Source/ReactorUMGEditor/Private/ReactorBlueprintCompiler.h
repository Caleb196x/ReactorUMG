#pragma once

#include "KismetCompilerModule.h"

class FReactorUMGBlueprintCompiler : public IBlueprintCompiler
{
public:
	// IBlueprintCompiler interface
	virtual bool CanCompile(const UBlueprint* Blueprint) override;
	virtual void PreCompile(UBlueprint* Blueprint) override;
	virtual void Compile(UBlueprint* Blueprint, const FKismetCompilerOptions& CompilerOptions, FCompilerResultsLog& Results) override;
	virtual void PostCompile(UBlueprint* Blueprint) override;
	virtual bool GetBlueprintTypesForClass(UClass* ParentClass, UClass*& OutBlueprintClass, UClass*& OutBlueprintGeneratedClass) const override;
	// End of IBlueprintCompiler interface

public:
	virtual ~FReactorUMGBlueprintCompiler() {}
};
