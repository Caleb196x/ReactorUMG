#pragma once

class FMixinGenerator
{
public:

	static void InitMixinTSFile();

	static void GenerateBPMixinFile(const UBlueprint* Blueprint);

	static FString ProcessTemplate(const FString& TemplateContent, FString BlueprintPath, const FString& FileName);
	
	static FString MixinTSFilePath;

	static FString MixinTemplateFilePath;

	static FString StartGameTSFilePath;
};
