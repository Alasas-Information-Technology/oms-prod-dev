import bcrypt from "bcryptjs";

(async () => {

    const hash =
        await bcrypt.hash(
            "Admin@123",
            12
        );

    console.log(hash);

})();


$2b$12$Kc2yA7JkSEO3Int / sooNiuTHIwaMXa5gAh89WRsJmjltk5unWPoiK