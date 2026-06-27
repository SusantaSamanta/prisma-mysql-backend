import { Router } from "express";
import { __dirname } from "../index.js";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();

router.get('/attendance', (req, res) => {
    res.sendFile(__dirname + "/public/attendancePage.html")
});
router.post('/attendance', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(401).json({ success: false, message: "All field require" });
    }
    try {
        const isUserExists = await prisma.User.findUnique({
            where: {
                email,
            }
        })
        if (isUserExists) {
            if (isUserExists.password != password) {
                return res.status(401).json({ success: false, message: "Email or password not match.." });
            }
            
            const lastAttendance = isUserExists.updatedAt.toLocaleDateString("en-GB");
            const todayDate = new Date().toLocaleDateString("en-GB");
            
            if (lastAttendance === todayDate) {
                return res.status(401).json({ success: false, message: "Attendance already taken, try tomorrow." });
            }

            const updateUser = await prisma.User.update({
                where: {
                    email
                },
                data: {
                    attendances: [
                        ...isUserExists.attendances,
                        {
                            status: "present",
                            date: Date.now(),
                        }
                    ],
                }
            })
            return res.status(201).json({ success: true, message: "Attendance successfully." });
        }

        // if user not exist then create new user
        const user = await prisma.User.create({
            data: {
                name,
                email,
                password,
                attendances: [
                    {
                        status: "present",
                        date: Date.now(),
                    }
                ],
                // lastAttendance
            }
        });
        if (user) {
            res.status(201).json({ success: true, message: "Attendance successfully." });
        } else {
            res.status(401).json({ success: false, message: "Not able to give attendance." });
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: "Api not working.." });
    }
    finally {
        await prisma.$disconnect();
    }

});








export const attendanceRoutes = router;