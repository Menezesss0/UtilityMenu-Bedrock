import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { GamemodeUiManager } from "../api/gamemodeManager";
import { ClearUIManager } from "../api/clearManager";
import { timeMenu } from "./timeMenu";
import { weatherMenu } from "./weatherMenu";
import { difficultyMenu } from "./difficultyMenu";
import { TagUIManager } from "../api/tagManager";
import { ScoreboardUIManager } from "../api/scoreboardManager";
import { BlocksUIManager } from "../api/blocksManager";

export function mainMenu(player: Player) {
  const modal = new ActionFormData()
    .title("§l§2Utility§6Menu§r §l- §oBy: @menezesss0")
    .button("Gamemode", "textures/items/diamond") // 0
    .button("Difficulty", "textures/ui/strength_effect") // 1
    .button("Time", "textures/ui/icon_summer") // 2
    .button("Weather", "textures/ui/icon_recipe_nature") // 3
    .button("Blocks", "textures/blocks/command_block_side_mipmap") // 4
    .button("Scoreboard Settings", "textures/ui/servers") // 5
    .button("Tag Management", "textures/items/name_tag") // 6
    .button("Clear Menu", "textures/ui/trash"); // 7

  modal.show(player).then((r) => {
    if (r.canceled) return;

    const menus = [
      GamemodeUiManager.openMainMenu,
      difficultyMenu,
      timeMenu,
      weatherMenu,
      BlocksUIManager.openMainMenu,
      ScoreboardUIManager.openMainMenu,
      TagUIManager.openMainMenu,
      ClearUIManager.openMainMenu,
    ];

    return menus[r.selection as number](player);
  });
}
