#include "AutoMixinEditor.h"

#include "BlueprintEditorModule.h"
#include "ContentBrowserModule.h"
#include "Styling/SlateStyleRegistry.h"
#include "MixinGenerator.h"
#include "ReactorUtils.h"

#define LOCTEXT_NAMESPACE "FAutoMixinEditorModule"

static const FString PUERTS_RESOURCES_PATH = FReactorUtils::GetPluginDir() / TEXT("Resources"); // Puerts资源路径

TSharedPtr<FSlateStyleSet> FAutoMixinEditorModule::StyleSet = nullptr;

// 存储最后一个标签页
static TWeakPtr<SDockTab> LastForegroundTab = nullptr;

// 标签切换事件句柄
static FDelegateHandle TabForegroundedHandle;

// 获取AssetEditorSubsystem
static UAssetEditorSubsystem* AssetEditorSubsystem = nullptr;

// 编辑器窗口
static IAssetEditorInstance* AssetEditorInstance = nullptr;

// 最后激活的蓝图指针
static UBlueprint* LastBlueprint = nullptr;

void FAutoMixinEditorModule::StartupModule()
{
	// 获取AssetEditorSubsystem
	AssetEditorSubsystem = GEditor->GetEditorSubsystem<UAssetEditorSubsystem>();

	FMixinGenerator::InitMixinTSFile();
	InitStyleSet(); // 初始化样式
	RegistrationButton(); // 注册按键
	RegistrationContextButton(); // 注册右键菜单

	// 订阅标签切换事件
	TabForegroundedHandle = FGlobalTabmanager::Get()->OnTabForegrounded_Subscribe(
		FOnActiveTabChanged::FDelegate::CreateLambda([](const TSharedPtr<SDockTab>& NewlyActiveTab, const TSharedPtr<SDockTab>& PreviouslyActiveTab)
		{
			if (!NewlyActiveTab.IsValid() || NewlyActiveTab == LastForegroundTab.Pin())
			{
				return;
			}
			// 不等于主要的Tab（比如EventGraph，等图标）也返回
			if (NewlyActiveTab.Get()->GetTabRole() != MajorTab) return;
			LastForegroundTab = NewlyActiveTab;
			if (LastForegroundTab.IsValid())
			{
				// UE_LOG(LogTemp, Log, TEXT("标签页已切换: %s"), *LastForegroundTab.Pin().Get()->GetTabLabel().ToString());
			}
		})
	);
}

// 注册按键
void FAutoMixinEditorModule::RegistrationButton() const
{
	// 获取蓝图编辑器模块
	FBlueprintEditorModule& BlueprintEditorModule = FModuleManager::LoadModuleChecked<FBlueprintEditorModule>("Kismet");

	// 创建一个菜单扩展器
	const TSharedPtr<FExtender> MenuExtender = MakeShareable(new FExtender());

	// 向工具栏添加扩展
	MenuExtender->AddToolBarExtension(
		"Debugging", // 扩展点名称（在调试工具栏区域）
		EExtensionHook::First, // 插入位置（最前面）
		nullptr, // 不使用命令列表
		FToolBarExtensionDelegate::CreateLambda([this](FToolBarBuilder& ToolbarBuilder)
		{
			// 添加工具栏按钮
			ToolbarBuilder.AddToolBarButton(
				FUIAction( // 按钮动作
					FExecuteAction::CreateLambda([this]() // 点击时执行的lambda
					{
						ButtonPressed(); // 调用按钮点击处理函数
					})
				),
				NAME_None, // 没有命令名
				LOCTEXT("GenerateTemplate", "创建TS文件"), // 按钮显示文本
				LOCTEXT("GenerateTemplateTooltip", "生成TypeScript文件"), // 按钮提示文本
				FSlateIcon(GetStyleName(), "MixinIcon") // 按钮图标（这里使用空图标）
			);
		})
	);

	// 将扩展器添加到蓝图编辑器的菜单扩展管理器
	BlueprintEditorModule.GetMenuExtensibilityManager()->AddExtender(MenuExtender);
}

// 在内容浏览器右键的时候注册一个按键
void FAutoMixinEditorModule::RegistrationContextButton() const
{
	FContentBrowserModule& ContentBrowserModule = FModuleManager::LoadModuleChecked<FContentBrowserModule>(TEXT("ContentBrowser"));
	TArray<FContentBrowserMenuExtender_SelectedAssets>& CBMenuAssetExtenderDelegates = ContentBrowserModule.GetAllAssetViewContextMenuExtenders();

	// 创建菜单扩展委托
	FContentBrowserMenuExtender_SelectedAssets MenuExtenderDelegate;
	MenuExtenderDelegate.BindLambda([this](const TArray<FAssetData>& SelectedAssets)
	{
		TSharedRef<FExtender> Extender = MakeShared<FExtender>();

		Extender->AddMenuExtension(
			"GetAssetActions", // 扩展菜单的锚点位置
			EExtensionHook::After, // 在指定锚点之后插入
			nullptr, // 无命令列表
			FMenuExtensionDelegate::CreateLambda([this, SelectedAssets](FMenuBuilder& MenuBuilder)
			{
				// 添加菜单项
				MenuBuilder.AddMenuEntry(
					LOCTEXT("GenerateTSFile", "创建TS文件"), // 菜单文本
					LOCTEXT("GenerateTSFileTooltip", "生成TypeScript文件"), // 提示信息
					FSlateIcon(GetStyleName(), "MixinIcon"), // 使用自定义图标
					FUIAction(
						FExecuteAction::CreateLambda([this, SelectedAssets]()
						{
							// 点击时处理选中的资源
							ContextButtonPressed(SelectedAssets);
						}),
						FCanExecuteAction::CreateLambda([SelectedAssets]()
						{
							// 可选：验证是否允许执行（例如至少选中一个资产）
							return SelectedAssets.Num() > 0;
						})
					)
				);
			})
		);
		return Extender;
	});

	// 注册扩展委托
	CBMenuAssetExtenderDelegates.Add(MenuExtenderDelegate);
}


// 当按钮被按下时调用此函数
void FAutoMixinEditorModule::ButtonPressed()
{
	// UE_LOG(LogTemp, Log, TEXT("ButtonPressed"));
	FMixinGenerator::GenerateBPMixinFile(GetActiveBlueprint());
}

void FAutoMixinEditorModule::ContextButtonPressed(const TArray<FAssetData>& SelectedAssets)
{
	// 确保至少有一个资产被选中
	if (SelectedAssets.IsEmpty()) return;
	for (const FAssetData& AssetData : SelectedAssets)
	{
		// 获取选中的蓝图
		if (const UBlueprint* Blueprint = Cast<UBlueprint>(AssetData.GetAsset()))
		{
			FMixinGenerator::GenerateBPMixinFile(Blueprint);
		}
	}
}

/**
 * @brief 获取当前激活的蓝图
 *
 * 遍历所有被编辑的资产，找到与最后前景标签匹配的活动蓝图。
 * 如果找到匹配的蓝图，则将其记录为最后激活的蓝图并返回。
 *
 * @return 当前激活的蓝图对象，如果未找到则返回nullptr
 */
UBlueprint* FAutoMixinEditorModule::GetActiveBlueprint()
{
	// 遍历所有被编辑的资产 并找到活动蓝图
	for (const TArray<UObject*> EditedAssets = AssetEditorSubsystem->GetAllEditedAssets(); UObject* EditedAsset : EditedAssets)
	{
		AssetEditorInstance = AssetEditorSubsystem->FindEditorForAsset(EditedAsset, false);

		if (!AssetEditorInstance || !IsValid(EditedAsset) || !EditedAsset->IsA<UBlueprint>()) continue;

		if (
			LastForegroundTab.Pin().Get()->GetTabLabel().ToString() ==
			AssetEditorInstance->GetAssociatedTabManager().Get()->GetOwnerTab().Get()->GetTabLabel().ToString()
		)
		{
			LastBlueprint = CastChecked<UBlueprint>(EditedAsset);
			break;
		}
	}

	// 返回最后激活的蓝图
	return LastBlueprint;
}

FName FAutoMixinEditorModule::GetStyleName()
{
	return FName(TEXT("MixinEditorStyle"));
}

/**
 * 初始化样式集合
 * 
 * 本函数负责初始化或重新初始化FAutoMixinEditorModule的样式集合
 * 它首先检查当前样式集合是否有效，如果有效，则从Slate样式注册表中注销该样式集合并重置
 * 然后，创建一个新的样式集合，设置必要的样式信息，并在Slate样式注册表中注册这个新的样式集合
 */
void FAutoMixinEditorModule::InitStyleSet()
{
	// 如果当前样式集合仍然有效，则注销并重置样式集合
	if (StyleSet.IsValid())
	{
		FSlateStyleRegistry::UnRegisterSlateStyle(*StyleSet);
		StyleSet.Reset();
	}

	// 创建一个新的样式集合，并指定其名称
	StyleSet = MakeShared<FSlateStyleSet>(GetStyleName());

	// 定义图标路径，从项目插件目录下指定子路径到达资源目录
	const FString IconPath = PUERTS_RESOURCES_PATH / TEXT("CreateFilecon.png");

	// 在样式集合中设置一个名为"MixinIcon"的图标，使用指定路径下的图像文件
	StyleSet->Set("MixinIcon", new FSlateImageBrush(IconPath, FVector2D(40, 40)));

	// 在Slate样式注册表中注册新的样式集合
	FSlateStyleRegistry::RegisterSlateStyle(*StyleSet);
}


void FAutoMixinEditorModule::ShutdownModule()
{
	if (StyleSet.IsValid())
	{
		FSlateStyleRegistry::UnRegisterSlateStyle(*StyleSet);
		StyleSet.Reset();
	}

	// 取消订阅标签切换事件
	FGlobalTabmanager::Get()->OnTabForegrounded_Unsubscribe(TabForegroundedHandle);
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_MODULE(FAutoMixinEditorModule, AutoMixinEditor)
