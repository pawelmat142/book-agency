export abstract class Theme {

    public static cssVar(name: string, value: string) {
        if (value) {
            document.documentElement.style.setProperty(`--${this.toKebabCase(name)}`, value);
        } else {
            document.documentElement.style.removeProperty(`--${this.toKebabCase(name)}`);
        }
    }

    public static setTheme(theme: Object) {
        Object.entries(theme).forEach(([key, value]) => {
            Theme.cssVar(key, value)
        })
    }
    private static toKebabCase(camelCaseStr: string): string {
        return camelCaseStr
            .replace(/([a-z])([A-Z])/g, '$1-$2') // Handles camelCase
            .replace(/([a-zA-Z])(\d)/g, '$1-$2') // Handles transitions from a letter to a digit
            .toLowerCase();
    }

    // private static toKebabCase(camelCaseStr: string): string {
    //     return camelCaseStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    // }
    
}