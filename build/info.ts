import type { Plugin } from 'vite'
import gradient from 'gradient-string'
import { getPackageSize } from './utils'
import dayjs, { type Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import boxen, { type Options as BoxenOptions } from 'boxen'
dayjs.extend(duration)

const welcomeMessage = gradient(['cyan', 'magenta']).multiline(`1.完成，大于完美。但「完成」不等于「能用就行」。\n2.出来混，迟早要还。技术债的利息，比你想象的更高——还得比你预料的更快。\n3.承认不知道，比装作知道更有力量。说一句「我还没搞懂」只需要一秒钟的勇气，假装搞懂的代价，可能需要三个月来偿还。\n4.评审代码时，记住对面坐着的是一个和你一样会犯错的人。尖锐地指出问题，温和地对待人。\n5.周五下午不上线，长假前一天不部署，凌晨三点不改配置。你可以相信假期，但是你绝对不能相信马上要放假的人。\n6.技术会过时，框架会消亡。但你的判断的能力、学习的潜力和诚实的品质，永远不会贬值。\n7.你不是在编写程序，你是在解决问题，解决人的问题，以及程序的问题。`)

const boxenOptions: BoxenOptions = {
    padding: 0.5,
    borderColor: 'cyan',
    borderStyle: 'round',
}

export function viteBuildInfo(): Plugin {
    let config: { command: string }
    let startTime: Dayjs
    let endTime: Dayjs
    let outDir: string
    return {
        name: 'vite:buildInfo',
        configResolved(resolvedConfig) {
            config = resolvedConfig
            outDir = resolvedConfig.build?.outDir ?? 'dist'
        },
        buildStart() {
            console.log(boxen(welcomeMessage, boxenOptions))
            if (config.command === 'build') {
                startTime = dayjs(new Date())
            }
        },
        closeBundle() {
            if (config.command === 'build') {
                endTime = dayjs(new Date())
                getPackageSize({
                    folder: outDir,
                    callback: (size: string) => {
                        console.log(boxen(gradient(['cyan', 'magenta']).multiline(`🎉 恭喜打包完成（总用时${dayjs.duration(endTime.diff(startTime)).format('mm分ss秒')}，打包后的大小为${size}）`), boxenOptions))
                    },
                })
            }
        },
    }
}
