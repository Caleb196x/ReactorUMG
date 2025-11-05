/// <reference path="puerts.d.ts" />
declare module "ue" {
    import {$Ref, $Nullable} from "puerts"

    import * as cpp from "cpp"

    import * as UE from "ue"

// __TYPE_DECL_START: 68B8166A48B19B774BCFCA9F7CE3D98E
    namespace Game.SkyBox {
        class SkyBox_C extends UE.StaticMeshActor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): SkyBox_C;
            static Load(InName: string): SkyBox_C;
        
            __tid_SkyBox_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 4268054D4C6645EC807C5DAACAEDCA6C
    namespace Game.TestReactor {
        class TestReactor_C extends UE.ReactorUIWidget {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): TestReactor_C;
            static Load(InName: string): TestReactor_C;
        
            __tid_TestReactor_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 8731287F4F6C08A3171883829BD8A389
    namespace Game.NewWidgetBlueprint {
        class NewWidgetBlueprint_C extends UE.UserWidget {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): NewWidgetBlueprint_C;
            static Load(InName: string): NewWidgetBlueprint_C;
        
            __tid_NewWidgetBlueprint_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 9D29B5664FFB26DFD79143BD5F5E642C
    namespace Game.FirstPerson.Blueprints.BP_Weapon_Component {
        class BP_Weapon_Component_C extends UE.SkeletalMeshComponent {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            ["First PersonCharacter"]: UE.Game.FirstPerson.Blueprints.BP_FirstPersonCharacter.BP_FirstPersonCharacter_C;
            ProjectileOffset: UE.Vector;
            ExecuteUbergraph_BP_Weapon_Component(EntryPoint: number) : void;
            InpActEvt_IA_Shoot_K2Node_EnhancedInputActionEvent_0(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            /*
             *Blueprint implementable event for when the component is beginning play, called before its owning actor's BeginPlay
             *or when the component is dynamically created if the Actor has already BegunPlay.
             */
            ReceiveBeginPlay() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_Weapon_Component_C;
            static Load(InName: string): BP_Weapon_Component_C;
        
            __tid_BP_Weapon_Component_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 5B0A94C8478FD9897AA6FE984D9B71C8
    namespace Game.FirstPerson.Blueprints.BP_Pickup_Rifle {
        class BP_Pickup_Rifle_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            SkeletalMesh: UE.SkeletalMeshComponent;
            SphereCollision: UE.SphereComponent;
            ProjectileOffset: UE.Vector;
            FirstPersonCharacterReference: UE.Game.FirstPerson.Blueprints.BP_FirstPersonCharacter.BP_FirstPersonCharacter_C;
            ["Character Has Weapon"]: boolean;
            BndEvt__BP_Rifle_SphereCollision_K2Node_ComponentBoundEvent_0_ComponentBeginOverlapSignature__DelegateSignature(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number, bFromSweep: boolean, SweepResult: UE.HitResult) : void;
            ExecuteUbergraph_BP_Pickup_Rifle(EntryPoint: number) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_Pickup_Rifle_C;
            static Load(InName: string): BP_Pickup_Rifle_C;
        
            __tid_BP_Pickup_Rifle_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 40438FBF4B2AD05D1C053B966D98E5DE
    namespace Game.FirstPerson.Blueprints.BP_FirstPersonProjectile {
        class BP_FirstPersonProjectile_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            ProjectileMovement: UE.ProjectileMovementComponent;
            Sphere: UE.StaticMeshComponent;
            CollisionComponent: UE.SphereComponent;
            ExecuteUbergraph_BP_FirstPersonProjectile(EntryPoint: number) : void;
            /*
             *Event when this actor bumps into a blocking object, or blocks another actor that bumps into it.
             *This could happen due to things like Character movement, using Set Location with 'sweep' enabled, or physics simulation.
             *For events when objects overlap (e.g. walking into a trigger) see the 'Overlap' event.
             *
             *@note For collisions during physics simulation to generate hit events, 'Simulation Generates Hit Events' must be enabled.
             *@note When receiving a hit from another object's movement (bSelfMoved is false), the directions of 'Hit.Normal' and 'Hit.ImpactNormal'
             *will be adjusted to indicate force from the other object against this object.
             *@note NormalImpulse will be filled in for physics-simulating bodies, but will be zero for swept-component blocking collisions.
             */
            ReceiveHit(MyComp: $Nullable<UE.PrimitiveComponent>, Other: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, bSelfMoved: boolean, HitLocation: UE.Vector, HitNormal: UE.Vector, NormalImpulse: UE.Vector, Hit: UE.HitResult) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_FirstPersonProjectile_C;
            static Load(InName: string): BP_FirstPersonProjectile_C;
        
            __tid_BP_FirstPersonProjectile_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 7EBF9EFE4EDDE0018A43D99F550A843C
    namespace Game.FirstPerson.Blueprints.BP_FirstPersonPlayerController {
        class BP_FirstPersonPlayerController_C extends UE.PlayerController {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            ExecuteUbergraph_BP_FirstPersonPlayerController(EntryPoint: number) : void;
            /*
             *Event when play begins for this actor.
             */
            ReceiveBeginPlay() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_FirstPersonPlayerController_C;
            static Load(InName: string): BP_FirstPersonPlayerController_C;
        
            __tid_BP_FirstPersonPlayerController_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 6D275C9045FC613CF516708DDB894EAE
    namespace Game.FirstPerson.Blueprints.BP_FirstPersonGameMode {
        class BP_FirstPersonGameMode_C extends UE.GameModeBase {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            DefaultSceneRoot: UE.SceneComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_FirstPersonGameMode_C;
            static Load(InName: string): BP_FirstPersonGameMode_C;
        
            __tid_BP_FirstPersonGameMode_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 48EC9B704D48DAEDF2C8919CE739C8C2
    namespace Game.FirstPerson.Blueprints.BP_FirstPersonCharacter {
        class BP_FirstPersonCharacter_C extends UE.Character {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            FirstPersonMesh: UE.SkeletalMeshComponent;
            FirstPersonCamera: UE.CameraComponent;
            ExecuteUbergraph_BP_FirstPersonCharacter(EntryPoint: number) : void;
            InpActEvt_IA_Jump_K2Node_EnhancedInputActionEvent_0(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Jump_K2Node_EnhancedInputActionEvent_1(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Look_K2Node_EnhancedInputActionEvent_3(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Move_K2Node_EnhancedInputActionEvent_2(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_FirstPersonCharacter_C;
            static Load(InName: string): BP_FirstPersonCharacter_C;
        
            __tid_BP_FirstPersonCharacter_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 406EA8FB4DF5FE9F154D0BB107BAC5DC
    namespace Game.FirstPersonArms.Animations.FirstPerson_AnimBP {
        class AnimBlueprintGeneratedMutableData extends UE.AnimBlueprintMutableData {
            constructor();
            constructor(__BoolProperty: boolean);
            __BoolProperty: boolean;
            /**
             * @deprecated use StaticStruct instead.
             */
            static StaticClass(): ScriptStruct;
            static StaticStruct(): ScriptStruct;
            __tid_AnimBlueprintGeneratedMutableData_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 406EA8FB4DF5FE9F154D0BB107BAC5DC
    namespace Game.FirstPersonArms.Animations.FirstPerson_AnimBP {
        class FirstPerson_AnimBP_C extends UE.AnimInstance {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            __AnimBlueprintMutables: UE.Game.FirstPersonArms.Animations.FirstPerson_AnimBP.AnimBlueprintGeneratedMutableData;
            AnimBlueprintExtension_PropertyAccess: UE.AnimSubsystemInstance;
            AnimBlueprintExtension_Base: UE.AnimSubsystemInstance;
            AnimGraphNode_Root: UE.AnimNode_Root;
            AnimGraphNode_TransitionResult_13: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_12: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_11: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_10: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_9: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_8: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_7: UE.AnimNode_TransitionResult;
            AnimGraphNode_SequencePlayer_9: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_9: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_8: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_8: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_7: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_7: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_6: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_6: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_5: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_5: UE.AnimNode_StateResult;
            AnimGraphNode_StateMachine_1: UE.AnimNode_StateMachine;
            AnimGraphNode_Slot: UE.AnimNode_Slot;
            AnimGraphNode_SaveCachedPose_1: UE.AnimNode_SaveCachedPose;
            AnimGraphNode_TransitionResult_6: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_5: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_4: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_3: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_2: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_1: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult: UE.AnimNode_TransitionResult;
            AnimGraphNode_SequencePlayer_4: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_4: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_3: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_3: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_2: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_2: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_1: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_1: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult: UE.AnimNode_StateResult;
            AnimGraphNode_StateMachine: UE.AnimNode_StateMachine;
            AnimGraphNode_SaveCachedPose: UE.AnimNode_SaveCachedPose;
            AnimGraphNode_UseCachedPose_1: UE.AnimNode_UseCachedPose;
            AnimGraphNode_UseCachedPose: UE.AnimNode_UseCachedPose;
            AnimGraphNode_BlendListByBool: UE.AnimNode_BlendListByBool;
            IsMoving: boolean;
            bIsInAir: boolean;
            HasRifle: boolean;
            FirstPersonCharacter: UE.Game.FirstPerson.Blueprints.BP_FirstPersonCharacter.BP_FirstPersonCharacter_C;
            AnimGraph(AnimGraph: $Ref<UE.PoseLink>) : void;
            /*
             *Executed when the Animation is updated
             */
            BlueprintUpdateAnimation(DeltaTimeX: number) : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_FirstPerson_AnimBP_AnimGraphNode_TransitionResult_274EC9B146631F45FDB52BB11F47D731() : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_FirstPerson_AnimBP_AnimGraphNode_TransitionResult_53F31B364AE1E94B7AB4B3B7BB0F164E() : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_FirstPerson_AnimBP_AnimGraphNode_TransitionResult_B902C16045F47029D8FF9A8AE4529E0E() : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_FirstPerson_AnimBP_AnimGraphNode_TransitionResult_D654D16F412EF3EFE1B50B94AB239895() : void;
            ExecuteUbergraph_FirstPerson_AnimBP(EntryPoint: number) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): FirstPerson_AnimBP_C;
            static Load(InName: string): FirstPerson_AnimBP_C;
        
            __tid_FirstPerson_AnimBP_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
}
