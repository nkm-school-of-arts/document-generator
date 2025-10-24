module.exports = {

    currentdate: {  
        regno: "Govt.Apro.Reg.No.142/11",
        date: "Date : " + new Date().toLocaleDateString(),
        fsize: 10,
        linecount: 16
    },

    fromText: {
        description: "From:",
        from: "     Dr. Smt S. Meenakshi,",
        title: "     (Director of Sri Natya Kala Mandir School of Arts)",
        address: "     No. 7A Ganapathi Street, 2nd Cross, Vasantham Nagar, Avadi, Chennai - 600071.",
        fsize: 11,
        linecount: 16 
    },


    toText: {
        description: "To:",
        from: "     {{toTitle}}",
        title: "     {{addressline1}}",
        address: "     {{addressline2}}",
        fsize: 11,
        linecount: 16 
    },

    introPassage:{
        description: "Respected Sir/Madam,",
        passage: "\t\t\t\tI, Natya Kala Ratna <B>Dr S Meenakshi</B>, (Director of Sri Natya kala mandir school of arts) taking my students to perform classical dance programs, including a recent international performance  in Malaysia.",
        fsize: 11,
        linecount: 18 
    },

    templePassage:{
        passage: "I humbly seek the blessing and opportunity to perform classical dance as an expression of devotion and seva to <B> {{godtitile}}</B> and <B>{{templeName}}</B>.",
        fsize: 11,
        linecount: 18 
    },

    schedulePassage:{
        passage: "I respectfully request a performance slot on <B>{{requestedDate}}</B>. We kindly seek your support and consideration for this opportunity. ",
        fsize: 11,
        linecount: 18 
    },

    contactPassage:{
        passage: "I can be reached at <B>srinatyakalamandir@gmail.com</B> & <B>+91 98405 27761</B> ",
        fsize: 11,
        linecount: 18 
    },
    
    thanksNote:{
        passage: " <B>Thanking you.</B> ",
        fsize: 11,
        linecount: 14
    },

    regardsNote:{
        passage: "Yours Sincerely,",
        fsize: 11,
        linecount: 18,
        rightMargin: 200 
    },

    nameNote:{
        name: "Natya Kala Ratna Dr. Smt. S. Meenakshi.",
        tittle: "Director of Sri Natya Kala Mandir School of Arts",
        fsize: 11,
        linecount: 18, 
        rightMargin: 250
    },
    titleNote:{
        tittle: "Director of Sri Natya Kala Mandir School of Arts",
        fsize: 11,
        linecount: 18, 
        rightMargin: 270
    }





    
};