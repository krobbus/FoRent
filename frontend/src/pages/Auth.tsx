import React, { useState, type ChangeEvent } from 'react'
import type { AuthProps } from '../utils/props'

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
                const data = await response.json();

                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    setUserId(data.user.id);
                    setUserRole(data.user.role);
                } else {
                    alert("Registration successful! Please log in.");
                    setIsLogin(true);
                }
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
                <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
                <p>Please {isLogin ? 'log in' : 'sign up'} your account to continue</p>
            </header>

            <main>
                <form onSubmit={handleSubmit}>
                    <fieldset className='authField'>
                        <legend>Account {isLogin ? 'Log In' : 'Sign Up Credentials'}</legend>
                        
                        <div id='username'>
                            <label>{isLogin ? 'Email or Username' : 'Username'} <span>*</span></label>
                            <input name={isLogin ? 'loginId' : 'username'} type='text' placeholder={isLogin ? 'Enter your email or username' : 'Enter your username'} autoComplete={isLogin ? 'loginId' : 'username'} onChange={handleChange} required />
                        </div>
                        
                        <div id='password'>              
                            <label>Password <span>*</span></label>
                            <input name='password' type='password' placeholder="Enter your password" autoComplete={isLogin ? 'current-password' : 'new-password'} onChange={handleChange} required />
                        </div>

                        {!isLogin && (
                            <>
                                <div id='pin'> 
                                    <label>PIN <span>*</span></label>
                                    <input name='pin' type='password' placeholder="Enter your PIN" autoComplete='pin' onChange={handleChange} required />
                                </div>

                                <div id='role'>
                                    <label>Role <span>*</span></label>
                                    <select name='role' onChange={handleChange} required>
                                        <option value='' className="default">Select Role</option>
                                        <option value='landlord'>Landlord</option>
                                        <option value='tenant'>Tenant</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </fieldset>
                    
                    {!isLogin && (
                        <fieldset className='infoField'>
                            <legend>Personal Information</legend>

                            <div id='firstName'>
                                <label>First Name <span>*</span></label>
                                <input name='firstName' type='text' placeholder="Enter your first name" autoComplete='firstName' onChange={handleChange} required />
                            </div>

                            <div id='middleName'>
                                <label>Middle Name</label>
                                <input name='middleName' type='text' placeholder="Enter your middle name" autoComplete='middleName' onChange={handleChange} />
                            </div>

                            <div id='lastName'>
                                <label>LastName <span>*</span></label>
                                <input name='lastName' type='text' placeholder="Enter your last name" autoComplete='lastName' onChange={handleChange} required />
                            </div>

                            <div id='extName'>
                                <label>Extension</label>
                                <input name='extension' type='text' placeholder="e.g. jr., sr., III" autoComplete='extenstion' onChange={handleChange} />
                            </div>
                            
                            <div id='email'>
                                <label>Email <span>*</span></label>
                                <input name='email' type='email' placeholder="e.g. XXXXXXX@XXXXX.com" autoComplete='email' onChange={handleChange} required />
                            </div>
                            
                            <div id='contactNumber'>
                                <label>Contact Number</label>
                                <input name='contactNumber' type='text' placeholder="09XXXXXXXXX" autoComplete='contactNumber' onChange={handleChange} />
                            </div>
                        </fieldset>
                    )}
                    
                    <section className='btnWrapper'>
                        <button className='authBtn' type='submit'>{isLogin ? 'Login' : 'Register'}</button>
                        <button className='switchBtn' type='button' onClick={() => setIsLogin(!isLogin)}>Switch to {isLogin ? 'Registration' : 'Login'}</button>
                        <button className='backBtn' type='button' onClick={goBack}>Go Back</button>
                    </section>
                </form>
            </main>
        </section>
    )
}

export default Auth