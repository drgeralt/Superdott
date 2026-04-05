const { useEffect, useRef } = React;

const CountUp = ({
    to,
    from = 0,
    duration = 2,
    delay = 0,
    separator = '',
    className = ''
}) => {
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const counter = { value: from };
        const formatNumber = (num) => {
            let str = Math.floor(num).toString();
            if (separator) {
                str = str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
            }
            return str;
        };

        node.textContent = formatNumber(from);
        gsap.to(counter, {
            value: to,
            duration: duration,
            delay: delay,
            ease: "power3.out",
            onUpdate: () => {
                node.textContent = formatNumber(counter.value);
            }
        });
    }, [from, to, duration, delay, separator]);

    return <span className={className} ref={ref} />;
};