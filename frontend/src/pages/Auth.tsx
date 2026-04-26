import React, { useState, type ChangeEvent } from 'react'
import type { AuthProps } from './props'

function Auth({ goBack, setUserRole, setUserId }: AuthProps){
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        pin: '',
        role: '',
        firstName: '',
        middleName: '',
        lastName: '',
        extension: '',
        email: '',
        contactNumber: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: ChangeEvent) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/login' : '/api/register';
        
        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('user', JSON.stringify(user));
                setUserId(user.id);
                setUserRole(user.role);
            } else {
                alert("Auth failed!");
            }
        } catch (error) {
            console.error("Connection error:", error);
        }
    };

    return (
        <section id='authContainer'>
            <header>
                <h1 className='mainTitle'>{isLogin ? 'LOG IN' : 'SIGN UP'}</h1>
                <p className='subTitle'>Please {isLogin ? 'log in' : 'sign up'} your account to continue</p>
            </header>

            <main>
                <form onSubmit={handleSubmit}>
                    <label>Username:</label>
                    <input name='username' type='text' placeholder="Enter your username" autoComplete='username' onChange={handleChange} required />
                    
                    <label>Password:</label>
                    <input name='password' type='password' placeholder="Enter your password" autoComplete={isLogin ? 'current-password' : 'new-password'} onChange={handleChange} required />

                    {!isLogin && (
                        <>
                            <label>PIN:</label>
                            <input name='pin' type='password' placeholder="Enter your PIN" autoComplete='pin' onChange={handleChange} required />
                            
                            <label>Role:</label>
                            <select name='role' onChange={handleChange} required>
                                <option value=''>Select Role</option>
                                <option value='landlord'>Landlord</option>
                                <option value='tenant'>Tenant</option>
                            </select>

                            <label>First Name:</label>
                            <input name='firstName' type='text' placeholder="Enter your first name" autoComplete='firstName' onChange={handleChange} required />

                            <label>Middle Name:</label>
                            <input name='middleName' type='text' placeholder="Enter your middle name" autoComplete='middleName' onChange={handleChange} />

                            <label>LastName:</label>
                            <input name='lastName' type='text' placeholder="Enter your last name" autoComplete='lastName' onChange={handleChange} required />

                            <label>Extension:</label>
                            <input name='extension' type='text' placeholder="e.g. jr., sr., III" autoComplete='extenstion' onChange={handleChange} />

                            <label>Email:</label>
                            <input name='email' type='email' placeholder="e.g. XXXXXXX@XXXXX.com" autoComplete='email' onChange={handleChange} required />

                            <label>Contact Number:</label>
                            <input name='contactNumber' type='text' placeholder="09XXXXXXXXX" autoComplete='contactNumber' onChange={handleChange} />
                        </>
                    )}

                    <div className='btnWrapper'>
                        <button className='authBtn' type='submit'>{isLogin ? 'Login' : 'Register'}</button>
                        <button className='switchBtn' type='button' onClick={() => setIsLogin(!isLogin)}>Switch to {isLogin ? 'Registration' : 'Login'}</button>
                        <button className='backBtn' type='button' onClick={goBack}>Go Back</button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default Auth