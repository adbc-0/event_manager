module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "react",
        "react-hooks"
    ],
    "rules": {
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "react-hooks/exhaustive-deps": "error"
        // "max-len": ["error", { "code": 80 }]
    }
}
