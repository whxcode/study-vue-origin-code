// 不执行任何操作
export function noop() {}
export const no = () => false
export const identity = (_: any) => _

export const notProduction = () => process.env.NODE_ENV !== 'production'

export function makeMap(str: string,expectsLowerCase?: boolean) : (key: string) => true | void {
    const map = Object.create(null)
    const list: Array<string>  = str.split(',')
    for(const value of list) {
        map[value] = true
    }
    return (key: string) => {
        return expectsLowerCase ? map[key.toLocaleString()] : map[key]
    }
}
