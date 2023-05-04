const register = `
<html>

<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;1,300&display=swap"
        rel="stylesheet">
    <style>
        body {
            display: inline-block;
            align-items: center;
            font-family: 'Roboto', sans-serif;
            width: 600px;
        }

        h1 {
            font-weight: 400;
        }

        p {
            font-weight: 300;
            margin-bottom: 50px;
        }

        p.italics {
            font-style: italic;
        }

        p.end {
            margin-bottom: 20px;
        }

        p.bold {
            font-weight: 400;
        }

        .banner {
            width: 100%;
            height: auto;
        }

        img .social {
            height: 50;
            width: 50;
        }

        div.svg-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 50px;
        }

        button {
            background-color: #525252;
            cursor: pointer;
            border-radius: 5px;
            border: none;
            color: white;
            padding: 15px 42px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
        }
    </style>
    <title>Welcome to Kruz!</title>
</head>

<body>

    <p>Dear {{options.name}},</p>



    <p>Thank you for signing up for Kruz, the ultimate video content sharing platform! We're excited to have you as a
        member of our community, and we can't wait to see the amazing content you'll share with us.</p>

    <p>As a Kruz user, you'll have access to a wide range of video content from all over the world, and you'll be able
        to connect with other users who share your interests. Whether you're into comedy, music, sports, or anything in
        between, Kruz has something for everyone.
    </p>

    <p>To get started, simply log in to your Kruz account and start exploring! You can search for videos by keyword or
        browse through our curated collections to find content that interests you. And when you find something you love,
        be sure to share it with your friends and followers!</p>

    
    <p>If you have any questions or need help getting started, our support team is always here to help. Just send us an
        email at [support email address] and we'll get back to you as soon as possible.</p>


    <p class="end">Thank you again for joining Kruz. We're thrilled to have you as part of our community, and we can't wait to see what you'll create!,</p>
    <p>Best regards,
        <strong>

            The KRUZ team
        </strong>
    </p>
</body>

</html>`;
const login = `
<html>

<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;1,300&display=swap"
        rel="stylesheet">
    <style>
        body {
            display: inline-block;
            align-items: center;
            font-family: 'Roboto', sans-serif;
            width: 600px;
        }

        h1 {
            font-weight: 400;
        }

        p {
            font-weight: 300;
            margin-bottom: 50px;
        }

        p.italics {
            font-style: italic;
        }

        p.end {
            margin-bottom: 20px;
        }

        p.bold {
            font-weight: 400;
        }

        .banner {
            width: 100%;
            height: auto;
        }

        img .social {
            height: 50;
            width: 50;
        }

        div.svg-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 50px;
        }

        button {
            background-color: #525252;
            cursor: pointer;
            border-radius: 5px;
            border: none;
            color: white;
            padding: 15px 42px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
        }
    </style>
    <title>Login Notification</title>
</head>

<body>

    <p>Dear {{options.name}},</p>



    <p>We wanted to let you know that your KRUZ account was recently accessed. If this was you, there's nothing to worry about - we're just sending you this notification to keep your account secure.</p>

    <p>If you did not log in, we recommend that you change your password immediately to prevent any unauthorized access to your account. You can change your password by going to your account settings and selecting "Change Password".
    </p>

    <p>If you have any questions or concerns, please don't hesitate to contact our support team at [support email address]. We're here to help you keep your account secure and ensure that you have the best possible experience on KRUZ.</p>


    <p class="end">Thanks for being a part of the KRUZ community!</p>
    <p>Best regards,
        <strong>

            The KRUZ team
        </strong>
    </p>
</body>

</html>`;
