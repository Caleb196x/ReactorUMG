#include "MixinGenerator.h"
#include "ReactorUtils.h"
#include "Framework/Notifications/NotificationManager.h"
#include "Widgets/Notifications/SNotificationList.h"

FString FMixinGenerator::MixinTSFilePath = FPaths::Combine(FReactorUtils::GetPluginDir(), TEXT("Resources"), TEXT("mixin.ts"));
FString FMixinGenerator::MixinTemplateFilePath = FPaths::Combine(FReactorUtils::GetPluginDir(), TEXT("Resources"), TEXT("MixinTemplate.ts"));
FString FMixinGenerator::StartGameTSFilePath = FPaths::Combine(FReactorUtils::GetGamePlayTSHomeDir(), TEXT("start_game.ts"));

void FMixinGenerator::InitMixinTSFile()
{
	if (!FPaths::FileExists(StartGameTSFilePath))
	{
		FFileHelper::SaveStringToFile(TEXT(""), *StartGameTSFilePath, FFileHelper::EEncodingOptions::ForceUTF8);
	}
	
	const FString TargetProjectMixinPath = FPaths::Combine(FReactorUtils::GetGamePlayTSHomeDir(), TEXT("mixin.ts"));
	if (!FPaths::FileExists(TargetProjectMixinPath) &&
		FPaths::FileExists(MixinTSFilePath))
	{
		FReactorUtils::CopyFile(MixinTSFilePath, TargetProjectMixinPath);
	}
}

FString FMixinGenerator::ProcessTemplate(const FString& TemplateContent, FString BlueprintPath, const FString& FileName)
{
	FString Result = TemplateContent;
	FString ProjectName = FApp::GetProjectName();
	
	// 获取蓝图完整类名（包括_C后缀）
	BlueprintPath += TEXT("_C");
	const FString BlueprintClass = TEXT("UE") + BlueprintPath.Replace(TEXT("/"), TEXT("."));

	const FString BLUEPRINT_PATH = TEXT("BLUEPRINT_PATH"); // 蓝图路径
	const FString MIXIN_BLUEPRINT_TYPE = TEXT("MIXIN_BLUEPRINT_TYPE"); // 混入蓝图类型
	const FString TS_NAME = TEXT("TS_NAME"); // TS文件名
	const FString PROJECT_NAME = TEXT("PROJECT_NAME");

	Result = Result.Replace(*BLUEPRINT_PATH, *BlueprintPath); // 替换 蓝图路径
	Result = Result.Replace(*MIXIN_BLUEPRINT_TYPE, *BlueprintClass); // 替换 混入蓝图类型
	Result = Result.Replace(*TS_NAME, *FileName); // 替换 TS文件名
	Result = Result.Replace(*PROJECT_NAME, *ProjectName); // 替换 项目名

	return Result;
}

void FMixinGenerator::GenerateBPMixinFile(const UBlueprint* Blueprint)
{
	if (!Blueprint)
	{
		return;
	}
	
	// 获取蓝图的路径名称
	const FString BlueprintPath = Blueprint->GetPathName();
	FString Lefts, Rights;
	BlueprintPath.Split(".", &Lefts, &Rights);

	// ts文件路径
	FString TsFilePath = FReactorUtils::GetGamePlayTSHomeDir() + Lefts.Mid(5) /* 排除掉/Game */ + TEXT(".ts");

	// 如果ts文件不存在，则创建它
	if (FPaths::FileExists(TsFilePath))
	{
		return;
	}

	// 解析蓝图路径以获取文件名
	TArray<FString> StringArray;
	Rights.ParseIntoArray(StringArray, TEXT("/"), false);
	const FString FileName = StringArray[StringArray.Num() - 1];

	// 读取模板文件
	FString TemplateContent;
	if (FFileHelper::LoadFileToString(TemplateContent, *MixinTemplateFilePath))
	{
		// 处理模板并生成ts文件内容
		const FString TsContent = ProcessTemplate(TemplateContent, BlueprintPath, FileName);
		// 保存生成的内容到文件
		if (FFileHelper::SaveStringToFile(TsContent, *TsFilePath, FFileHelper::EEncodingOptions::ForceUTF8))
		{
			// 显示通知
			FNotificationInfo Info(FText::Format(NSLOCTEXT("MiXinGenerator", "TsFileGenerated", "TS文件生成成功->路径{0}"), FText::FromString(TsFilePath)));
			Info.ExpireDuration = 5.f;
			FSlateNotificationManager::Get().AddNotification(Info);
			
			FString MainGameTsContent;
			if (FFileHelper::LoadFileToString(MainGameTsContent, *StartGameTSFilePath))
			{
				const FString TsPath = Lefts.Mid(5);
				if (!MainGameTsContent.Contains(TEXT("import \".") + TsPath + "\";"))
				{
					MainGameTsContent += TEXT("import \"."+TsPath + "\";\n");
					FFileHelper::SaveStringToFile(MainGameTsContent, *StartGameTSFilePath, FFileHelper::EEncodingOptions::ForceUTF8);
					UE_LOG(LogTemp, Log, TEXT("MainGame.ts更新成功"));
				}
			} else
			{
				MainGameTsContent += TEXT("import \"."+ Lefts.Mid(5) + "\";\n");
				FFileHelper::SaveStringToFile(MainGameTsContent, *StartGameTSFilePath, FFileHelper::EEncodingOptions::ForceUTF8);
				UE_LOG(LogTemp, Log, TEXT("MainGame.ts更新成功"));
			}
		}
	}
	else
	{
		// 如果模板文件不存在，记录警告
		UE_LOG(LogTemp, Warning, TEXT("MixinTemplate.ts不存在"));
	}
}
