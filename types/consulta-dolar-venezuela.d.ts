declare module "consulta-dolar-venezuela" {
    export function getMonitor(
        source: "bcv" | "dolartoday" | "dolartoday_api",
        type: "price" | "percentage"
    ): Promise<number>;
}