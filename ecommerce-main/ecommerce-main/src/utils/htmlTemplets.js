export const signUpTemplate = (confirmationLink) => `
<!DOCTYPE html>
<html>
<head>
    <title>Activate Your Account</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            text-align: center;
            padding: 40px;
        }
        .container {
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <p>Click the button below to activate your account:</p>
        <a href="${confirmationLink}" class="btn">Activate Account</a>
    </div>
</body>
</html>
`;

export const restePassTemp = (resetCode) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        .header {
            background-color: #007BFF;
            color: #ffffff;
            padding: 10px 0;
            font-size: 24px;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .content {
            margin: 20px 0;
            line-height: 1.6;
            color: #333;
        }
        .code {
            background-color: #007BFF;
            color: #ffffff;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 4px;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Password Reset Request</div>
        <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Use the code below to reset it:</p>
            <div class="code">${resetCode}</div>
            <p>This code will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</div>
    </div>
</body>
</html>
`;
