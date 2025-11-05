#pragma once
#include "CoreMinimal.h"
#include "Rive/RiveDescriptor.h"
#include "Rive/RiveStateMachine.h"
#include "Rive/RiveTextureObject.h"
#include "Slate/SRiveWidget.h"
#include "Runtime/UMG/Public/UMG.h"
#include "ReactRiveWidget.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FRiveReadyDelegate);

UCLASS()
class UReactRiveWidget : public UWidget
{
	GENERATED_BODY()
	
public:
	UPROPERTY(BlueprintAssignable, Category = Rive)
	FRiveReadyDelegate OnRiveReady;
	
	UFUNCTION(BlueprintCallable)
	void SetRiveDescriptor(const FRiveDescriptor& newDescriptor);

	UFUNCTION(BlueprintCallable)
	void SetRiveFile(URiveFile* InRiveFile, const FString& ArtBoard = TEXT(""), const FString& StateMachine=TEXT(""),
		uint8 ArtBoardIndex=0, uint8 FitType=1/*Contain*/, uint8 Alignment=4/*Center*/, float Scale=1.0f);
	
	UFUNCTION()
	void OnSWidgetSizeChanged(const FVector2D& NewSize);

	UFUNCTION(BlueprintCallable, Category = Rive)
	void SetAudioEngine(URiveAudioEngine* InRiveAudioEngine);

	UFUNCTION(BlueprintCallable, Category = Rive)
	URiveArtboard* GetArtboard() const;

	UFUNCTION(BlueprintCallable, Category=Rive)
	void SetStateMachine(const FString& StateMachineName);

protected:
	UPROPERTY(BlueprintReadOnly, EditAnywhere, Category = Rive)
	FRiveDescriptor RiveDescriptor;

	UFUNCTION()
	void CheckArtboardSize();

#if WITH_EDITOR
	virtual void PostEditChangeChainProperty(
		FPropertyChangedChainEvent& PropertyChangedEvent) override;
#endif
	
	virtual ~UReactRiveWidget() override;
	/**
	 * UWidget interfaces
	 */
	virtual void ReleaseSlateResources(bool bReleaseChildren) override;
	virtual void SynchronizeProperties() override;
	virtual TSharedRef<SWidget> RebuildWidget() override;
	virtual FReply NativeOnMouseButtonDown(
		const FGeometry& InGeometry,
		const FPointerEvent& InMouseEvent);
	virtual FReply NativeOnMouseButtonUp(
		const FGeometry& InGeometry,
		const FPointerEvent& InMouseEvent);
	virtual FReply NativeOnMouseMove(
		const FGeometry& InGeometry,
		const FPointerEvent& InMouseEvent);
#if WITH_EDITOR
	virtual const FText GetPaletteCategory() override;
#endif
	
private:
	void Setup();

	UFUNCTION()
	void OnRiveObjectReady();

	UFUNCTION()
	TArray<FString> GetArtboardNamesForDropdown() const;

	UFUNCTION()
	TArray<FString> GetStateMachineNamesForDropdown() const;
	FReply OnInput(const FGeometry& MyGeometry,
				   const FPointerEvent& MouseEvent,
				   const TFunction<bool(const FVector2f&, FRiveStateMachine*)>&
					   InStateMachineInputCallback);

	UPROPERTY(Transient)
	TObjectPtr<URiveTextureObject> RiveTextureObject;

	TSharedPtr<SRiveWidget> RiveWidget;
	FTimerHandle TimerHandle;

	FVector2f InitialArtboardSize;
	bool IsChangingFromLayout = false;
};

