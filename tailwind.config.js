export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            spacing: {
                'nav-img-sm': '16px 4px 9px',
                'nav-img': '16px 0 9px',
            },
            colors: {
                main1: '#000000',
                main2: '#258ef9',
                main3: '#01c7ba',
                // 交强险服务
                csprimary: '#1E40AF',
                cssecondary: '#3B82F6',
                csaccent: '#F97316',
                // e点达
                eprimary: '#165DFF',
                esecondary: '#36B37E',
                eaccent: '#FFC107',
                edark: '#172B4D',
                elight: '#F4F5F7',

                dltprimary: '#165DFF', // 主色：象征开放与专业
                dltsecondary: '#22C55E', // 辅色：代表协同发展
                dltaccent: '#FF9F43', // 强调色：突出数据成果
                dltdark: '#1E293B',
                dltlight: '#F8FAFC',
            },
            boxShadow: {
                airport: '0px 0px 14px 4px rgba(176, 211, 236, 0.50)',
            },
            backgroundColor: {
                nav1: '#FFFFFF',
                nav2: '#0752C8',
                nav3: '#529955',

                main1: '#006FC8',
                main2: '#000000',
                main3: '#01c7ba',

                main1bg: '#EBF1FE',
                // main1: ' #258ef9',
                gray1: '#F7F8F9',
                gray2: '#F6F7FB',
                'main-0.5': 'rgba(0,111,200,0.5)',
            },
            backgroundImage: {
                ecosystem: 'linear-gradient(90deg, #FFFFFF 0%,rgba(255, 255, 255, 0) 100%);',
                service: 'linear-gradient(90deg, #00A2FF 0%, rgba(0,162,255,0.5) 100%);',
                service1: 'linear-gradient(90deg, #01c7ba 0%, rgba(1,199,186,0.5) 100%);',
                service2: 'linear-gradient(90deg, #546bf0 0%, rgba(84,107,240,0.5) 100%);',
            },
            animation: {
                'notice-x-init': 'notice-x-init var(--animation-timer) linear',
                'notice-x': 'notice-x var(--animation-timer) linear infinite',
                'pop-bottom': 'pop-bottom var(--animation-timer) ease-in-out',
                'scale-3s': 'scale-3s 3s ease-in-out forwards',
            },
            keyframes: {
                'notice-x-init': {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'notice-x': {
                    '0%': { transform: 'translateX(var(--container-width))' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'pop-bottom': {
                    '0%': { opacity: 0, transform: 'translateY(100%)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'scale-3s': {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.5)' },
                },
            },
        },
    },
    plugins: [require('tailwind-scrollbar')],
}
