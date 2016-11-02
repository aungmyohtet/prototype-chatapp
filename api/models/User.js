/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    userName:{
      type: 'string'
    },
    name: {
      type: 'string'
    },
    email: {
      type: 'email'
    },
    role: {
      type: 'string',
      enum: ['owner', 'member']
    },
    status: {
      type: 'string',
      enum: ['active', 'blocked']
    },
    team: {
      model: 'team'
    }
  }
};
