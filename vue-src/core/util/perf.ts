import { inBrowser } from "./env"
import {notProduction} from "../../shared/util";
export let mark
export let measure
if(notProduction()) {
    const perf = inBrowser && window.performance
    if(
        perf && perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures
    ) {
        mark = tag => perf.mark(tag)
        measure = (name,startTag,endTag) => {
            perf.measure(name,startTag,endTag)
            perf.clearMarks(startTag)
            perf.clearMarks(endTag)
            perf.clearMeasures(name)
        }
    }
}
