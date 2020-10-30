import config from "../config"
import { warn } from './debug'
import { inBrowser } from './env'
import {notProduction} from "../../shared/util";
export function handleError(err: Error,vm: any,info: string) {
    if(config.errorHandler) {
        config.errorHandler(null,err,vm,info)
    } else {
        if(notProduction()) {
            warn(`Error in ${ info }: "${ err.toString() }"`,vm)
        }
        if(inBrowser && typeof console !== 'undefined') {
            console.error(err)
        } else {
            throw err
        }
    }
}
