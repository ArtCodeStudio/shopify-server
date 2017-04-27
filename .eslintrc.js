module.exports = {
    "extends": "google",
    "env": {
        "es6": true
    },
    "rules": {
        "max-len": [1, 160, 4],
        "spaced-comment": ["error", "always", {
            "line": {
                "markers": ["/"],
                "exceptions": ["-", "+"]
            },
            "block": {
                "markers": ["!"],
                "exceptions": ["*", "!"],
                "balanced": true
            }
        }]
    }
};