const e = require('express');
const moment = require('moment');

module.exports =
{

    formatDate: function (date, format) {
        return moment(date).format(format)
    },

    shortenPassword: function (pass) {
        return pass.substr(0, 15);
    },
    shortenDescription: function (desc) {
        if (desc.length >= 16) {
            return `${desc.substr(0, 32)}...`;
        }
        else {
            return `${desc}`
        }
    },
    checkEquality: function (userOne, userTwo, taskId) {
        if (userOne.toString() == userTwo.toString()) {
            return `
            <div class="d-flex py-3">
            <a href="/tasks/edit/${taskId}" class="btn btn-primary mx-2">
                        Edit
                    </a>

                <form action="/tasks/delete/${taskId}?_method=DELETE" method="POST">
                <a class="btn btn-danger mx-2 text-light">
                        Delete
                        </a>
                </form>

                <a href="/tasks" class="btn btn-warning mx-2 text-light">
                        Go Back
                    </a>
                `
        }
        else {
            return `
              <a href="/tasks" class="btn btn-warning py-2 text-light">
                        Go Back
                    </a>
            `;
        }
    },
    select: function (selected, options) {
        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');
    }
}