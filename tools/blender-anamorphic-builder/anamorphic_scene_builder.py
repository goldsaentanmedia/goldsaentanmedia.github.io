bl_info = {
    "name": "Anamorphic 3D Scene Builder",
    "author": "goldsaentanmedia",
    "version": (1, 0, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar > Anamorphic",
    "description": "Build a standardized anamorphic 3D billboard scene (screen, camera angle, sign height) and save/load presets so every project matches.",
    "category": "3D View",
}

import json
import math
import os

import bpy
from bpy.props import FloatProperty, IntProperty, PointerProperty, StringProperty
from bpy.types import Operator, Panel, PropertyGroup

COLLECTION_NAME = "Anamorphic_Scene"
SCREEN_NAME = "Anamorphic_Screen"
TARGET_NAME = "Anamorphic_Target"
CAMERA_NAME = "Anamorphic_Camera"
SUN_NAME = "Anamorphic_Sun"


class AnamorphicSettings(PropertyGroup):
    screen_width: FloatProperty(
        name="Screen Width (m)", default=10.0, min=0.01, unit="LENGTH"
    )
    screen_height: FloatProperty(
        name="Screen Height (m)", default=6.0, min=0.01, unit="LENGTH"
    )
    sign_height: FloatProperty(
        name="Sign Height from Ground (m)",
        description="Height of the bottom edge of the screen above the ground",
        default=3.0,
        min=0.0,
        unit="LENGTH",
    )
    view_distance: FloatProperty(
        name="Viewing Distance (m)",
        description="Horizontal distance from the screen to the camera",
        default=25.0,
        min=0.1,
        unit="LENGTH",
    )
    view_angle: FloatProperty(
        name="Viewing Angle (deg)",
        description="Horizontal angle of the camera off the screen's perpendicular, the standard anamorphic sweet-spot angle",
        default=35.0,
        min=-89.0,
        max=89.0,
    )
    camera_height: FloatProperty(
        name="Camera / Eye Height (m)", default=1.6, min=0.0, unit="LENGTH"
    )
    camera_lens: FloatProperty(
        name="Camera Lens (mm)", default=35.0, min=1.0
    )
    resolution_x: IntProperty(name="Resolution X", default=1920, min=4)
    resolution_y: IntProperty(name="Resolution Y", default=1080, min=4)
    preset_name: StringProperty(name="Preset Name", default="default")


def _get_or_create_collection():
    coll = bpy.data.collections.get(COLLECTION_NAME)
    if coll is None:
        coll = bpy.data.collections.new(COLLECTION_NAME)
        bpy.context.scene.collection.children.link(coll)
    return coll


def _remove_existing(coll, name):
    obj = bpy.data.objects.get(name)
    if obj is not None:
        coll.objects.unlink(obj) if obj.name in coll.objects else None
        bpy.data.objects.remove(obj, do_unlink=True)


def build_scene(settings):
    coll = _get_or_create_collection()
    for name in (SCREEN_NAME, TARGET_NAME, CAMERA_NAME, SUN_NAME):
        _remove_existing(coll, name)

    screen_center_z = settings.sign_height + settings.screen_height / 2.0

    screen_mesh = bpy.data.meshes.new(SCREEN_NAME)
    screen_obj = bpy.data.objects.new(SCREEN_NAME, screen_mesh)
    coll.objects.link(screen_obj)
    half_w = settings.screen_width / 2.0
    verts = [
        (-half_w, 0.0, settings.sign_height),
        (half_w, 0.0, settings.sign_height),
        (half_w, 0.0, settings.sign_height + settings.screen_height),
        (-half_w, 0.0, settings.sign_height + settings.screen_height),
    ]
    screen_mesh.from_pydata(verts, [], [[0, 1, 2, 3]])
    screen_mesh.update()

    target_empty = bpy.data.objects.new(TARGET_NAME, None)
    target_empty.empty_display_type = "PLAIN_AXES"
    target_empty.empty_display_size = 0.5
    target_empty.location = (0.0, 0.0, screen_center_z)
    coll.objects.link(target_empty)

    angle_rad = math.radians(settings.view_angle)
    cam_x = settings.view_distance * math.sin(angle_rad)
    cam_y = -settings.view_distance * math.cos(angle_rad)

    cam_data = bpy.data.cameras.new(CAMERA_NAME)
    cam_data.lens = settings.camera_lens
    cam_obj = bpy.data.objects.new(CAMERA_NAME, cam_data)
    cam_obj.location = (cam_x, cam_y, settings.camera_height)
    coll.objects.link(cam_obj)

    track = cam_obj.constraints.new(type="TRACK_TO")
    track.target = target_empty
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"

    sun_data = bpy.data.lights.new(SUN_NAME, type="SUN")
    sun_data.energy = 3.0
    sun_obj = bpy.data.objects.new(SUN_NAME, sun_data)
    sun_obj.location = (0.0, -settings.view_distance, settings.screen_height + settings.sign_height + 5.0)
    sun_obj.rotation_euler = (math.radians(55), 0.0, math.radians(35))
    coll.objects.link(sun_obj)

    scene = bpy.context.scene
    scene.camera = cam_obj
    scene.render.resolution_x = settings.resolution_x
    scene.render.resolution_y = settings.resolution_y

    return cam_obj, screen_obj


def _presets_dir():
    path = bpy.path.abspath("//anamorphic_presets/")
    os.makedirs(path, exist_ok=True)
    return path


def _settings_to_dict(settings):
    return {
        "screen_width": settings.screen_width,
        "screen_height": settings.screen_height,
        "sign_height": settings.sign_height,
        "view_distance": settings.view_distance,
        "view_angle": settings.view_angle,
        "camera_height": settings.camera_height,
        "camera_lens": settings.camera_lens,
        "resolution_x": settings.resolution_x,
        "resolution_y": settings.resolution_y,
    }


def _dict_to_settings(data, settings):
    for key, value in data.items():
        if hasattr(settings, key):
            setattr(settings, key, value)


class ANAMORPHIC_OT_build_scene(Operator):
    bl_idname = "anamorphic.build_scene"
    bl_label = "Build Anamorphic Scene"
    bl_description = "Create/update the screen, camera and lighting from the settings below"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        build_scene(context.scene.anamorphic_settings)
        self.report({"INFO"}, "Anamorphic scene built")
        return {"FINISHED"}


class ANAMORPHIC_OT_save_preset(Operator):
    bl_idname = "anamorphic.save_preset"
    bl_label = "Save Preset"
    bl_description = "Save the current settings as a reusable preset (stored next to the .blend file)"

    def execute(self, context):
        settings = context.scene.anamorphic_settings
        if not bpy.data.filepath:
            self.report({"ERROR"}, "Save the .blend file first so the preset has a project folder")
            return {"CANCELLED"}
        name = settings.preset_name.strip() or "default"
        filepath = os.path.join(_presets_dir(), f"{name}.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(_settings_to_dict(settings), f, indent=2)
        self.report({"INFO"}, f"Preset saved: {filepath}")
        return {"FINISHED"}


class ANAMORPHIC_OT_load_preset(Operator):
    bl_idname = "anamorphic.load_preset"
    bl_label = "Load Preset"
    bl_description = "Load a previously saved preset by name"

    def execute(self, context):
        settings = context.scene.anamorphic_settings
        if not bpy.data.filepath:
            self.report({"ERROR"}, "Save the .blend file first so the preset folder can be found")
            return {"CANCELLED"}
        name = settings.preset_name.strip() or "default"
        filepath = os.path.join(_presets_dir(), f"{name}.json")
        if not os.path.exists(filepath):
            self.report({"ERROR"}, f"Preset not found: {filepath}")
            return {"CANCELLED"}
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        _dict_to_settings(data, settings)
        self.report({"INFO"}, f"Preset loaded: {filepath}")
        return {"FINISHED"}


class ANAMORPHIC_PT_panel(Panel):
    bl_idname = "ANAMORPHIC_PT_panel"
    bl_label = "Anamorphic 3D Scene"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Anamorphic"

    def draw(self, context):
        layout = self.layout
        settings = context.scene.anamorphic_settings

        box = layout.box()
        box.label(text="Screen")
        box.prop(settings, "screen_width")
        box.prop(settings, "screen_height")
        box.prop(settings, "sign_height")

        box = layout.box()
        box.label(text="Camera")
        box.prop(settings, "view_distance")
        box.prop(settings, "view_angle")
        box.prop(settings, "camera_height")
        box.prop(settings, "camera_lens")
        box.prop(settings, "resolution_x")
        box.prop(settings, "resolution_y")

        layout.operator("anamorphic.build_scene", icon="MOD_BUILD")

        box = layout.box()
        box.label(text="Presets")
        box.prop(settings, "preset_name")
        row = box.row(align=True)
        row.operator("anamorphic.save_preset", icon="EXPORT")
        row.operator("anamorphic.load_preset", icon="IMPORT")


classes = (
    AnamorphicSettings,
    ANAMORPHIC_OT_build_scene,
    ANAMORPHIC_OT_save_preset,
    ANAMORPHIC_OT_load_preset,
    ANAMORPHIC_PT_panel,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.anamorphic_settings = PointerProperty(type=AnamorphicSettings)


def unregister():
    del bpy.types.Scene.anamorphic_settings
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    register()
