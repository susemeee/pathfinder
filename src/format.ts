import chalk from "chalk";
import type { DirectionsResponse, Route, Guide } from "./api.js";

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

function formatFare(won: number): string {
  return won > 0 ? `${won.toLocaleString()}원` : "-";
}

function trafficStateLabel(state: number): string {
  switch (state) {
    case 0:
      return chalk.gray("정보없음");
    case 1:
      return chalk.green("원활");
    case 2:
      return chalk.yellow("서행");
    case 3:
      return chalk.red("지체");
    case 4:
      return chalk.redBright("정체");
    case 6:
      return chalk.gray("통행불가");
    default:
      return chalk.gray(`상태${state}`);
  }
}

function printRoute(route: Route, index: number, total: number): void {
  const label =
    total > 1
      ? chalk.bold.cyan(`📍 경로 ${index + 1}/${total}`)
      : chalk.bold.cyan("📍 경로 정보");

  console.log(`\n${label}`);
  console.log(chalk.dim("─".repeat(50)));

  const s = route.summary;
  console.log(
    `  출발: ${chalk.white(s.origin.name || `${s.origin.x}, ${s.origin.y}`)}`
  );
  console.log(
    `  도착: ${chalk.white(s.destination.name || `${s.destination.x}, ${s.destination.y}`)}`
  );

  if (s.waypoints?.length) {
    console.log(`  경유지: ${s.waypoints.map((w) => w.name || `${w.x},${w.y}`).join(" → ")}`);
  }

  console.log(chalk.dim("─".repeat(50)));
  console.log(
    `  거리: ${chalk.bold(formatDistance(s.distance))}    시간: ${chalk.bold(formatDuration(s.duration))}`
  );
  console.log(
    `  택시비: ${formatFare(s.fare.taxi)}    통행료: ${formatFare(s.fare.toll)}`
  );
  console.log(`  우선순위: ${s.priority}`);

  if (route.sections?.length) {
    for (const section of route.sections) {
      if (section.guides?.length) {
        console.log(chalk.dim("\n  🧭 턴바이턴 안내:"));
        for (const g of section.guides) {
          if (g.guidance) {
            console.log(
              `    ${chalk.dim("→")} ${g.guidance} ${chalk.dim(`(${formatDistance(g.distance)}, ${formatDuration(g.duration)})`)}`
            );
          }
        }
      }

      if (section.roads?.length) {
        console.log(chalk.dim("\n  🛣️  주요 도로:"));
        const significantRoads = section.roads.filter(
          (r) => r.name && r.distance > 100
        );
        for (const r of significantRoads.slice(0, 10)) {
          console.log(
            `    ${r.name} ${chalk.dim(formatDistance(r.distance))} ${trafficStateLabel(r.traffic_state)} ${chalk.dim(`${r.traffic_speed}km/h`)}`
          );
        }
        if (significantRoads.length > 10) {
          console.log(chalk.dim(`    ... 외 ${significantRoads.length - 10}개 도로`));
        }
      }
    }
  }
}

export function printDirectionsResponse(
  response: DirectionsResponse,
  json: boolean
): void {
  if (json) {
    console.log(JSON.stringify(response, null, 2));
    return;
  }

  const successRoutes = response.routes.filter((r) => r.result_code === 0);
  const failedRoutes = response.routes.filter((r) => r.result_code !== 0);

  if (successRoutes.length === 0) {
    console.log(chalk.red("\n❌ 경로를 찾을 수 없습니다."));
    for (const r of failedRoutes) {
      console.log(chalk.red(`  ${r.result_msg}`));
    }
    return;
  }

  for (let i = 0; i < successRoutes.length; i++) {
    printRoute(successRoutes[i], i, successRoutes.length);
  }

  if (failedRoutes.length > 0) {
    console.log(chalk.yellow(`\n⚠️  ${failedRoutes.length}개 대안 경로 실패`));
  }

  console.log();
}
