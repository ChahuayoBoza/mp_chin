import bcrypt from 'bcryptjs';

const users = [
    {
        name: 'Chin',
        email: 'chin@gmail.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true,
    },
    {
        name: 'Gaby',
        email: 'gaby@gmail.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
    },
    {
        name: 'Ayrton',
        email: 'ayrton@gmail.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true,
    },
];

export default users;