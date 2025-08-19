import { Player, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { mainMenu } from "./mainMenu";

export function timeMenu(player: Player) {
  const modal = new ActionFormData()
    .title("§l§2U§6M§r | §dTime§r - Settings")
    .button("§6§lSunrise", "textures/ui/time_1sunrise") // 0
    .button("§e§lDay", "textures/ui/time_2day") // 1
    .button("§f§lNoon", "textures/ui/time_3noon") // 2
    .button("§d§lSunset", "textures/ui/time_4sunset") // 3
    .button("§9§lNight", "textures/ui/time_5night") // 4
    .button("§lMidnight", "textures/ui/time_6midnight") // 5
    .button("§c§lBack", "textures/ui/arrow_left"); // 6

  modal.show(player).then((r) => {
    if (r.canceled) return;

    const times = [
      { time: 23000, name: "§6Sunrise" },
      { time: 1000, name: "§eDay" },
      { time: 6000, name: "§fNoon" },
      { time: 12000, name: "§dSunset" },
      { time: 13000, name: "§9Night" },
      { time: 18000, name: "§7Midnight" },
    ];

    const selected = times[r.selection as number];

    if (r.selection == 6) return mainMenu(player);

    try {
      world.setTimeOfDay(selected.time);
      player.sendMessage(`§aThe time has been set to §l${selected.name}`);
      return timeMenu(player);
    } catch {
      return player.sendMessage("§4An error occurred. Please try again later.");
    }
  });
}
