/**
 * queueT - Dead simple, Redis-based, message broker for NodeJS
 * https://github.com/tradologics/queuet
 *
 * Copyright 2020 Tradologics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const ioredis = require("ioredis");
const microtime = require('microtime');

var conn,
    sub_conn,
    conn_url,
    queue_name,
    conn_options = {
        maxRetriesPerRequest: 10,
        retryStrategy: function (times) {
            var delay = Math.min(times * 50, 2000);
            return delay;
        },
        reconnectOnError: function (err) {
            var targetError = "READONLY";
            if (err.message.slice(0, targetError.length) === targetError) {
                // Only reconnect when the error starts with "READONLY"
                return true; // or `return 1;`
            }
        }
    };


function main_connection() {
    // main connection
    if (conn === undefined) {
        conn = new ioredis(conn_url, conn_options);
    }
    return conn;
}


function subsciber_connection() {
    // main connection
    main_connection();

    // subscriber connection
    if (sub_conn === undefined) {
        sub_conn = new ioredis(conn_url, conn_options);
    }
    return sub_conn;
}

function parse_id(id) {
    // prepare id in the correct format
    id = id.toString().replace(queue_name + ':', '');
    return queue_name + ':' + id;
}

function get_item(id, callback) {
    // get item by id
    main_connection();
    id = parse_id(id);
    conn.get(id).then(function (data) {
        callback(id, JSON.parse(data));
    });
}


function disconnect() {
    // disconnect from all
    if (conn !== undefined) {
        conn.disconnect();
        conn = undefined;
    }
    if (sub_conn !== undefined) {
        sub_conn.disconnect();
        sub_conn = undefined;
    }
}


module.exports = {

    redis: ioredis,
    connection: main_connection(),
    disconnect: disconnect,

    initialize: function (qname, conn_str, options) {
        queue_name = qname;
        conn_url = conn_str;
        conn_options = options || {};
    },


    publish: function (data) {
        main_connection();
        const id = microtime.now().toString() + Math.floor(100 + Math.random() * 900).toString();
        conn.set(parse_id(id), JSON.stringify(data));
        return conn.publish(queue_name, id);
    },

    handle_backlog: function (callback) {
        main_connection();
        var stream = conn.scanStream({ match: queue_name + ':*' });
        stream.on('data', function (keys) {
            for (const key in keys.sort()) {
                get_item(keys[key], callback);
            }
        });
    },

    subscribe: (callback) => {
        subsciber_connection();
        sub_conn.subscribe(queue_name);
        sub_conn.on("message", (queue_name, id) => {
            get_item(id, callback);
        });

    },

    delete: function (id) {
        main_connection();
        return conn.del(parse_id(id));
    }
};
