from flask import Blueprint, jsonify


commands_api = Blueprint(
    "commands_api",
    __name__
)


COMMANDS = [

    {
        "name": "warn",
        "category": "Moderation",
        "description": "Warn a user",
        "permission": "Moderator",
        "usage": "/warn @user reason"
    },


    {
        "name": "ticket setup",
        "category": "Tickets",
        "description": "Create ticket panels",
        "permission": "Administrator",
        "usage": "/ticket setup"
    }

]



@commands_api.route("/commands")
def commands():

    return jsonify(COMMANDS)
