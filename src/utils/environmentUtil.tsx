export const isDevelopmentEnvironment = () => {
    return process.env.REACT_APP_ENVIRONMENT === "development";
}

export const isTestEnvironment = () => {
    return process.env.REACT_APP_ENVIRONMENT === "test";
}

export const isDemoEnvironment = () => {
    return process.env.REACT_APP_ENVIRONMENT === "demo";
}

export const isProductionEnvironment = () => {
    return process.env.REACT_APP_ENVIRONMENT === "production";
}