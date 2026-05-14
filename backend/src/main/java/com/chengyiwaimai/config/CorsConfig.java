package com.chengyiwaimai.config;

import com.chengyiwaimai.security.JwtInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    private final JwtInterceptor jwtInterceptor;
    private final String[] allowedOrigins;

    public CorsConfig(JwtInterceptor jwtInterceptor,
                      @Value("${chengyi.allowed-origins}") String allowedOrigins) {
        this.jwtInterceptor = jwtInterceptor;
        this.allowedOrigins = parseOrigins(allowedOrigins);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor).addPathPatterns("/**");
    }

    private String[] parseOrigins(String value) {
        return java.util.Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toArray(String[]::new);
    }
}
