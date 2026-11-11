const { default: nodemailer } = require('nodemailer');
const Booking = require('../models/bookingModel');
const Show = require('../models/showModel');


const holdSeatsAndCreateBooking = async (req, res) => {
    try {
        const { showId, selectedSeats } = req.body;
        const userId = req.user.id; // Protect middleware se user ID mili

        if (!showId || !selectedSeats || selectedSeats.length === 0) {
            return res.status(400).json({ message: "Show ID aur Seats select karna zaroori hai." });
        }
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: "Show nahi mila!" });
        }
        const currentTime = new Date();
        for (let seatNum of selectedSeats) {
            const showSeat = show.seats.find(s => s.seatNumber === seatNum);
            if (!showSeat) {
                return res.status(400).json({ message: `Seat ${seatNum} is show mein exist nahi karti.` });
            }
            if (showSeat.status === 'Booked') {
                return res.status(400).json({ message: `Sorry! Seat ${seatNum} pehle se hi booked ho chuki hai.` });
            }
            if (showSeat.status === 'Reserved' && showSeat.reservedUntil && showSeat.reservedUntil > currentTime) {
                return res.status(400).json({ message: `Seat ${seatNum} abhi kisi aur ke liye hold par hai.` });
            }
        }
        const lockTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // Current Time + 5 Minutes
        selectedSeats.forEach(seatNum => {
            const showSeat = show.seats.find(s => s.seatNumber === seatNum);
            showSeat.status = 'Reserved';
            showSeat.reservedUntil = lockTime;
        });
        await show.save();
        const totalAmount = show.ticketPrice * selectedSeats.length;
        const temporaryBooking = await Booking.create({
            user: userId,
            show: showId,
            seats: selectedSeats,
            totalPrice: totalAmount,
            status: 'Pending'
        });
        return res.status(201).json({
            message: "Seats agle 5 minute ke liye reserved ho gayi hain. Payment complete karein!",
            bookingId: temporaryBooking._id,
            totalPrice: totalAmount
        });
    } catch (error) {
        return res.status(500).json({ message: "Booking process mein koi error aayi", error: error.message });
    }
};

// const confirmBooking = async (req, res) => {
//     try {
//         const { bookingId } = req.body;

//         if (!bookingId) {
//             return res.status(400).json({ message: "Booking ID dena zaroori hai." });
//         }
//         const booking = await Booking.findById(bookingId);
//         if (!booking) {
//             return res.status(404).json({ message: "Booking record nahi mila!" });
//         }
//         if (booking.status === 'Confirmed') {
//             return res.status(400).json({ message: "Yeh ticket pehle se hi confirm ho chuki hai." });
//         }
//         await Show.updateOne(
//             { _id: booking.show, "seats.seatNumber": { $in: booking.seats } },
//             { 
//                 $set: { 
//                     "seats.$[elem].status": "Booked",
//                     "seats.$[elem].reservedUntil": null 
//                 } 
//             },
//             { arrayFilters: [{ "elem.seatNumber": { $in: booking.seats } }] }
//         );
//         const finalUpdatedBooking = await Booking.findByIdAndUpdate(
//             bookingId,
//             { $set: { status: 'Confirmed' } },
//             { new: true, runValidators: false } 
//         );
//         return res.status(200).json({
//             message: "Mubarak ho! Aapki ticket successfully book ho gayi hai! 🎉🍿",
//             bookingDetails: finalUpdatedBooking,
//             sendMail
//         });
//     } catch (error) {
//         console.error("Asli Confirmation Error:", error.message);
//         return res.status(500).json({ message: "Payment confirmation fail hui", error: error.message });
//     }
// };

const confirmBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ message: "Booking ID dena zaroori hai." });
        }

        // 1. Booking find karein
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking record nahi mila!" });
        }

        if (booking.status === 'Confirmed') {
            return res.status(400).json({ message: "Yeh ticket pehle se hi confirm ho chuki hai." });
        }

        // 2. Seats Update Query
        await Show.updateOne(
            { _id: booking.show, "seats.seatNumber": { $in: booking.seats } },
            { 
                $set: { 
                    "seats.$[elem].status": "Booked",
                    "seats.$[elem].reservedUntil": null 
                } 
            },
            { arrayFilters: [{ "elem.seatNumber": { $in: booking.seats } }] }
        );

        // 3. Booking confirm karein aur saari details (.populate) nikal lein email ke liye
        const finalUpdatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { status: 'Confirmed' } },
            { returnDocument: 'after', runValidators: false }
        )
        .populate('user', 'name email') // User ka naam aur email nikala
        .populate({
            path: 'show',
            select: '-seats',
            populate: { path: 'movie theatre' } // Movie aur Theatre ka naam nikala
        });

        // 4. 📧 NODEMAILER E-TICKET EMAIL SENDING LOGIC
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"CineVerse Tickets 🎬" <${process.env.EMAIL_USER}>`,
                to: finalUpdatedBooking.user.email, // User ka registered email
                subject: `🎟️ Ticket Confirmed: ${finalUpdatedBooking.show.movie.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 2px solid #f43f5e; border-radius: 12px; padding: 20px; background-color: #0b0f19; color: #ffffff;">
                        <h2 style="color: #f43f5e; text-align: center; margin-bottom: 5px;">CINEVERSE E-TICKET</h2>
                        <p style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 0;">Booking ID: ${finalUpdatedBooking._id}</p>
                        <hr style="border-color: #1e293b; margin: 20px 0;" />
                        
                        <p>Hi <strong>${finalUpdatedBooking.user.name}</strong>,</p>
                        <p style="color: #10b981; font-weight: bold;">Mubarak ho! Aapki movie ticket confirm ho gayi hai. 🎉</p>
                        
                        <div style="background-color: #131c2e; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 6px 0;">🎬 <strong>Movie:</strong> ${finalUpdatedBooking.show.movie.title}</p>
                            <p style="margin: 6px 0;">🏢 <strong>Theatre:</strong> ${finalUpdatedBooking.show.theatre.name} (${finalUpdatedBooking.show.theatre.location})</p>
                            <p style="margin: 6px 0;">📅 <strong>Date & Time:</strong> ${finalUpdatedBooking.show.date} at ${finalUpdatedBooking.show.time}</p>
                            <p style="margin: 6px 0;">💺 <strong>Seats:</strong> <span style="color: #3b82f6; font-weight: bold;">${finalUpdatedBooking.seats.join(', ')}</span></p>
                            <p style="margin: 6px 0;">💵 <strong>Total Paid:</strong> ₹${finalUpdatedBooking.totalPrice}</p>
                        </div>

                        <p style="font-size: 12px; color: #64748b; text-align: center;">Theatre entry par yeh email aur Booking ID dikhayein. Enjoy your show! 🍿</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ E-Ticket sent successfully to ${finalUpdatedBooking.user.email}`);
        } catch (emailError) {
            // Agar email bhejne me koi dikkat aaye, toh ticket booking cancel nahi honi chahiye
            console.error("⚠️ Ticket confirm ho gayi, par email send fail hua:", emailError.message);
        }

        // 5. Frontend ko response bhejein
        return res.status(200).json({
            message: "Mubarak ho! Ticket confirm ho gayi hai aur E-Ticket aapke email par bhej di gayi hai! 🎉📧",
            bookingDetails: finalUpdatedBooking
        });

    } catch (error) {
        console.error("Asli Confirmation Error:", error.message);
        return res.status(500).json({ message: "Payment confirmation fail hui", error: error.message });
    }
};


const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id; 
         const bookings = await Booking.find({ user: userId, status: 'Confirmed' })
            .populate({
                path: 'show',
                select: '-seats', 
                populate: [{ path: 'movie', select: 'title' },
                           { path: 'theatre'}]

            }).sort({ createdAt: -1});
        return res.status(200).json(bookings);
    } catch (error) {
        return res.status(500).json({ message: "Tickets load nahi ho payin", error: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try{
        const { bookingId } = req.body;
        const userId = req.user.id;
        if(!bookingId){
            return res.status(400).json({message: "please ! enter bookingId"});
        }
        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({message: "No Booking Available"});
        }

        if(booking.user.toString() !== userId){
            return res.status(400).json({message: " Only Authorized person can do ."});
        }
        if(booking.status === 'Cancelled'){
            return res.status(400).json({message: "Booking is Already cancelled"});
        }
        await Show.updateOne(
            { _id: booking.show, "seats.seatNumber": { $in: booking.seats } },
            { 
                $set: { 
                    "seats.$[elem].status": "Available",
                    "seats.$[elem].reservedUntil": null 
                } 
            },
            { arrayFilters: [{ "elem.seatNumber": { $in: booking.seats } }] }
        );

        
        const cancelledBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: { status: 'Cancelled' } },
            { new: true }
        );

        return res.status(200).json({
            message: "Ticket successfully cancel ho gayi hai aur seats wapas release kar di gayi hain! 🎟️❌",
            bookingDetails: cancelledBooking
        });

    }catch(error){
        console.error("Cancel Booking Error", error.message);
        return res.status(500).json({message: "Something went wrong ! ticket not cancelled", error: error.message});



    }
}

module.exports = { holdSeatsAndCreateBooking, confirmBooking, getUserBookings, cancelBooking};

