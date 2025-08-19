import { Difficulty, Player, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { mainMenu } from "./mainMenu";

export function difficultyMenu(player: Player) {
  const modal = new ActionFormData()
    .title("§l§2U§6M§r | §4Difficulty§r - Settings")
    .body("Select a difficulty to switch to.")
    .button("Hard", "textures/ui/hardcore/heart_half") // 0
    .button("Normal", "textures/ui/heart") // 1
    .button("Easy", "textures/ui/hardcore/absorption_heart") // 2
    .button("Peaceful", "textures/ui/hardcore/freeze_heart") // 3
    .button("§c§lBack", "textures/ui/arrow_left"); // 4

  modal.show(player).then((r) => {
    if (r.canceled) return;

    const difficulty = [
      { difficulty: Difficulty.Hard, name: "Hard" },
      { difficulty: Difficulty.Normal, name: "Normal" },
      { difficulty: Difficulty.Easy, name: "Easy" },
      { difficulty: Difficulty.Peaceful, name: "Peaceful" },
    ];

    const selected = difficulty[r.selection as number];

    if (r.selection == 4) return mainMenu(player);

    try {
      world.setDifficulty(selected.difficulty);
      player.sendMessage(`§aThe difficulty was successfully changed to ${selected.name}.`);
      return difficultyMenu(player);
    } catch {
      return player.sendMessage("§4An error occurred. Please try again later.");
    }
  });
}
