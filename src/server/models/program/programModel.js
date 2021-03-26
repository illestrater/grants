const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const program = {
    organizer: {
        type:  String,
        trim:  true,
        required: true,
    },
    name: {
        type:  String,
        trim:  true,
        required: true,
    },
    url: {
        type:  String,
        trim:  true,
        required: true,
    },
    description: {
        type:  String,
        trim:  true,
        required: true,
    },
    logistics: {
        type:  String,
        trim:  true,
        required: true,
    },
    criteria: {
        type:  String,
        trim:  true,
        required: true,
    },
    email: {
        type:  String,
        trim:  true,
        required: true,
    },
    website: {
        type:  String,
        trim:  true,
        required: true,
    },
    twitter: {
        type:  String,
        trim:  true,
    },
    instagram: {
        type:  String,
        trim:  true,
    },
    curators: [{
        user: {
            type:     mongoose.Schema.ObjectId,
            ref:      'User',
        },
    }],
    admins: [{
        user: {
            type:     mongoose.Schema.ObjectId,
            ref:      'User',
        },
    }],
    active: {
        type: Boolean,
    },
}

const ProgramSchema = new Schema(program);

ProgramSchema.set('toJSON', {
    getters:  true,
    virtuals: true
});

mongoose.model('Program', ProgramSchema);







const programApplicant = {
    user: {
        type:     mongoose.Schema.ObjectId,
        ref:      'User',
        required: true
    },
    program: {
        type:     mongoose.Schema.ObjectId,
        ref:      'Program',
        required: true
    },
    url: {
        type:  String,
        trim:  true,
    },
    statement: {
        type:  String,
        trim:  true,
        required: true
    },
    additional: {
        type:  String,
        trim:  true,
    },
    title: {
        type:  String,
        required: true,
    },
    description: {
        type:  String,
        required: true,
    },
    art:  {
        type:  String,
        required: true,
    },
    artWeb: {
        type:  String,
        required: true,
    },
    ineligible: {
        type: Boolean,
        default: false
    },
    flagged: [{
        id: {
            type:     String,
        },
        user: {
            type:     mongoose.Schema.ObjectId,
            ref:      'User',
        },
        type: {
            type:  String,
            trim:  true,
        },
        message: {
            type:     String,
        }
    }],
    approvalCount: {
        type:     Number,
        default:  0,
    },
    rejectCount: {
        type:     Number,
        default:  0,
    },
    approved: [{
        user: {
            type:     mongoose.Schema.ObjectId,
            ref:      'User',
        },
    }],
    rejected: [{
        user: {
            type:     mongoose.Schema.ObjectId,
            ref:      'User',
        },
    }],
    emailed: {
        type: Boolean,
        default: false
    },
    accepted: {
        type: Boolean,
        default: false
    },
    published: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number
    }
};

const ProgramApplicantSchema = new Schema(programApplicant);

ProgramApplicantSchema.set('toJSON', {
    getters:  true,
    virtuals: true
});

mongoose.model('ProgramApplicant', ProgramApplicantSchema);